import { useState, useCallback, useEffect, useMemo } from 'react'
import { CREATURE_STAGES, BADGES, EXP_RULES, DEFAULT_GOAL, STORAGE_KEYS } from '../utils/constants'
import { getToday, getYesterday, subtractDay } from '../utils/dateUtils'

const load = (key, def) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def }
  catch { return def }
}
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val))

const DEFAULT_SETTINGS = { goal: DEFAULT_GOAL }
const DEFAULT_NOTIF    = { enabled: false, time: '21:00' }

/** 공백 제외 글자 수 */
export const countChars = (text = '') => text.replace(/\s/g, '').length

function stageForExp(exp) {
  return CREATURE_STAGES.find(s => exp <= s.max) || CREATURE_STAGES[CREATURE_STAGES.length - 1]
}

const STREAK_MILESTONES = { 3: 1.3, 7: 1.5, 14: 1.5, 21: 1.5, 30: 2.0, 60: 2.0, 100: 3.0 }
const getStreakMultiplier = (streak) => STREAK_MILESTONES[streak] ?? 1.0

const isDone = (entry) => !!entry && countChars(entry.text) >= entry.goal

function dayExp(entry, streak) {
  const chars = countChars(entry.text)
  if (chars === 0) return 0
  if (chars < entry.goal) return EXP_RULES.partial
  const bonus = Math.min(EXP_RULES.bonusCap, Math.floor((chars - entry.goal) / 100) * EXP_RULES.bonusPer100)
  return Math.floor((EXP_RULES.goalBase + bonus) * getStreakMultiplier(streak))
}

/**
 * 모든 진행 상태(EXP·스트릭·배지)는 글 기록에서 매번 계산한다.
 * 글을 고치거나 지워도 상태가 어긋나지 않는다.
 */
function deriveGame(writings) {
  const dates = Object.keys(writings).sort()
  let streak = 0, maxStreak = 0, totalExp = 0, lastDone = null
  const expByDate = {}

  for (const date of dates) {
    const entry = writings[date]
    if (isDone(entry)) {
      streak = lastDone && subtractDay(date) === lastDone ? streak + 1 : 1
      lastDone = date
      maxStreak = Math.max(maxStreak, streak)
    }
    const exp = dayExp(entry, isDone(entry) ? streak : 0)
    expByDate[date] = exp
    totalExp += exp
  }

  const alive = lastDone === getToday() || lastDone === getYesterday()
  const badges = BADGES.filter(b => maxStreak >= b.requiredStreak)
  return { totalExp, streak: alive ? streak : 0, maxStreak, badges, expByDate }
}

export function useAppStore() {
  const [writings,       setWritings]       = useState(() => load(STORAGE_KEYS.WRITINGS, {}))
  const [settings,       setSettings]       = useState(() => ({ ...DEFAULT_SETTINGS, ...load(STORAGE_KEYS.SETTINGS, {}) }))
  const [darkMode,       setDarkMode]       = useState(() => load(STORAGE_KEYS.DARK_MODE, false))
  const [notifSettings,  setNotifSettings]  = useState(() => load(STORAGE_KEYS.NOTIF, DEFAULT_NOTIF))
  const [toasts,         setToasts]         = useState([])
  const [evolutionAlert, setEvolutionAlert] = useState(null)
  const [showConfetti,   setShowConfetti]   = useState(false)

  const gameState = useMemo(() => deriveGame(writings), [writings])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => {
    const next = !darkMode; setDarkMode(next); save(STORAGE_KEYS.DARK_MODE, next)
  }

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  const updateNotifSettings = useCallback((s) => {
    setNotifSettings(s); save(STORAGE_KEYS.NOTIF, s)
  }, [])

  // 목표 변경은 오늘 글부터 적용 (지난 글은 쓸 당시 목표 유지)
  const updateGoal = useCallback((goal) => {
    const next = { ...settings, goal }
    setSettings(next); save(STORAGE_KEYS.SETTINGS, next)
    const today = getToday()
    if (writings[today]) {
      const nextW = { ...writings, [today]: { ...writings[today], goal } }
      save(STORAGE_KEYS.WRITINGS, nextW); setWritings(nextW)
    }
  }, [settings, writings])

  // ── Writing ──────────────────────────────────────────────────────────────
  const saveWriting = useCallback((date, text) => {
    const prev = writings[date]
    const next = { ...writings }
    if (text.trim()) next[date] = { text, goal: settings.goal, updatedAt: new Date().toISOString() }
    else delete next[date]

    save(STORAGE_KEYS.WRITINGS, next)
    setWritings(next)

    const before = deriveGame(writings)
    const after  = deriveGame(next)

    if (!isDone(prev) && isDone(next[date])) {
      const exp = after.expByDate[date]
      showToast(`🎉 목표 달성! +${exp} EXP · 🔥 ${after.streak}일째`, after.streak >= 3 ? 'streak' : 'exp')
    }

    const oldStage = stageForExp(before.totalExp)
    const newStage = stageForExp(after.totalExp)
    if (newStage.stage > oldStage.stage) {
      setTimeout(() => {
        setEvolutionAlert({ from: oldStage, to: newStage })
        setTimeout(() => setEvolutionAlert(null), 3200)
      }, 400)
    }

    const newBadge = after.badges.find(b => !before.badges.some(x => x.id === b.id))
    if (newBadge) setTimeout(() => showToast(`🏅 배지 획득! ${newBadge.emoji} ${newBadge.name}`, 'badge'), 200)

    if (before.streak < 7 && after.streak >= 7) {
      setTimeout(() => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5500) }, 600)
    }
  }, [writings, settings.goal, showToast])

  // ── Derived ───────────────────────────────────────────────────────────────
  const getCreatureStage = useCallback((exp = gameState.totalExp) => stageForExp(exp), [gameState.totalExp])
  const getCurrentStreak = useCallback(() => gameState.streak, [gameState.streak])

  /** 오늘 목표 대비 진행률 (크리처 HP / 기분) */
  const getTodayRate = useCallback(() => {
    const entry = writings[getToday()]
    if (!entry) return 0
    return Math.min(1, countChars(entry.text) / entry.goal)
  }, [writings])

  // ── Export / Import ───────────────────────────────────────────────────────
  const exportData = useCallback(() => {
    const data = { version: '2.0-writing', exportedAt: new Date().toISOString(), writings: load(STORAGE_KEYS.WRITINGS, {}), settings: load(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS) }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `writing-creature-${getToday()}.json`; a.click(); URL.revokeObjectURL(url)
  }, [])

  const importData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (typeof data.writings !== 'object' || data.writings === null) throw new Error('invalid')
          save(STORAGE_KEYS.WRITINGS, data.writings); setWritings(data.writings)
          if (data.settings) { const s = { ...DEFAULT_SETTINGS, ...data.settings }; save(STORAGE_KEYS.SETTINGS, s); setSettings(s) }
          resolve(data)
        } catch { reject(new Error('잘못된 파일 형식이에요')) }
      }
      reader.onerror = () => reject(new Error('파일을 읽을 수 없어요'))
      reader.readAsText(file)
    })
  }, [])

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.WRITINGS)
    localStorage.removeItem(STORAGE_KEYS.SETTINGS)
    setWritings({}); setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    writings, saveWriting,
    settings, updateGoal,
    gameState,
    getCreatureStage, getCurrentStreak, getStreakMultiplier, getTodayRate,
    darkMode, toggleDarkMode,
    notifSettings, updateNotifSettings,
    toasts, showToast,
    evolutionAlert, showConfetti,
    exportData, importData,
    resetAllData,
  }
}
