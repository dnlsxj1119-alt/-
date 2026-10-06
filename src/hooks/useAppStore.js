import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { CREATURE_STAGES, BADGES, EXP_RULES, DEFAULT_GOAL, STORAGE_KEYS } from '../utils/constants'
import { getToday, getYesterday, subtractDay } from '../utils/dateUtils'
import { fetchAll, putWriting, putSettings, AuthError } from '../utils/api'

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

/**
 * 기록·EXP 계산에 쓰는 글자 수. 마감 지난 글을 고치면 고치기 직전 글자 수가
 * scoredChars 로 고정돼서, 나중에 고쳐도 연속 기록·EXP는 바뀌지 않는다.
 */
export const scoredChars = (entry) => entry?.scoredChars ?? countChars(entry?.text)
export const isDone = (entry) => !!entry && scoredChars(entry) >= entry.goal

// 삭제 표시(tombstone)는 동기화용으로만 보관하고 화면·계산에서는 뺀다
const visibleOf = (raw) => Object.fromEntries(Object.entries(raw).filter(([, e]) => !e.deleted))

function dayExp(entry, streak) {
  const chars = scoredChars(entry)
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

// 아직 서버에 못 보낸 날짜들 (새로고침해도 유지)
const dirty = new Set(load(STORAGE_KEYS.DIRTY, []))
const saveDirty = () => save(STORAGE_KEYS.DIRTY, [...dirty])
const markDirty = (dates) => { dates.forEach(d => dirty.add(d)); saveDirty() }

export function useAppStore() {
  const [rawWritings,    setRawWritings]    = useState(() => load(STORAGE_KEYS.WRITINGS, {}))
  const [settings,       setSettings]       = useState(() => ({ ...DEFAULT_SETTINGS, ...load(STORAGE_KEYS.SETTINGS, {}) }))
  const [authKey,        setAuthKey]        = useState(() => load(STORAGE_KEYS.AUTH, null))
  const [syncStatus,     setSyncStatus]     = useState('idle') // idle | syncing | synced | pending | offline
  const [darkMode,       setDarkMode]       = useState(() => load(STORAGE_KEYS.DARK_MODE, false))
  const [notifSettings,  setNotifSettings]  = useState(() => load(STORAGE_KEYS.NOTIF, DEFAULT_NOTIF))
  const [toasts,         setToasts]         = useState([])
  const [evolutionAlert, setEvolutionAlert] = useState(null)
  const [showConfetti,   setShowConfetti]   = useState(false)

  const writings  = useMemo(() => visibleOf(rawWritings), [rawWritings])
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

  // ── Local persistence (항상 로컬에 먼저 저장 → 서버는 뒤에서 동기화) ────────
  const rawRef   = useRef(rawWritings)
  const keyRef   = useRef(authKey)
  const flushTimer = useRef(null)
  const flushing   = useRef(false)
  const flushRef   = useRef(null)

  const commitRaw = useCallback((next) => {
    rawRef.current = next
    save(STORAGE_KEYS.WRITINGS, next)
    setRawWritings(next)
  }, [])

  const logout = useCallback(() => {
    keyRef.current = null
    localStorage.removeItem(STORAGE_KEYS.AUTH)
    setAuthKey(null)
    setSyncStatus('idle')
  }, [])

  const handleSyncError = useCallback((err) => {
    if (err instanceof AuthError) { logout(); showToast('🔒 비밀번호를 다시 입력해주세요', 'error') }
    else setSyncStatus('offline')
  }, [logout, showToast])

  // ── Server sync ───────────────────────────────────────────────────────────
  const flush = useCallback(async () => {
    const key = keyRef.current
    if (!key || flushing.current) return
    if (!dirty.size) { setSyncStatus('synced'); return }
    flushing.current = true
    setSyncStatus('syncing')
    try {
      for (const date of [...dirty]) {
        const local = rawRef.current[date]
        if (!local) { dirty.delete(date); continue }
        const server = await putWriting(key, date, local)
        // 전송 중에 또 고쳤으면 다음 번에 다시 보냄
        if (rawRef.current[date]?.updatedAt !== local.updatedAt) continue
        dirty.delete(date)
        if (server.updatedAt > local.updatedAt) commitRaw({ ...rawRef.current, [date]: server })
      }
      saveDirty()
      setSyncStatus(dirty.size ? 'pending' : 'synced')
    } catch (err) {
      handleSyncError(err)
    } finally {
      flushing.current = false
    }
    if (dirty.size && keyRef.current) {
      clearTimeout(flushTimer.current)
      flushTimer.current = setTimeout(() => flushRef.current(), 1500)
    }
  }, [commitRaw, handleSyncError])
  useEffect(() => { flushRef.current = flush }, [flush])

  const scheduleFlush = useCallback(() => {
    if (!keyRef.current) return
    setSyncStatus('pending')
    clearTimeout(flushTimer.current)
    flushTimer.current = setTimeout(flush, 1000)
  }, [flush])

  /** 서버 글을 받아 로컬과 합침. 날짜별로 더 최근에 고친 쪽이 이김 */
  const pull = useCallback(async (key) => {
    setSyncStatus('syncing')
    const { writings: server, settings: serverSettings } = await fetchAll(key)
    const local  = rawRef.current
    const merged = { ...local }
    for (const [d, e] of Object.entries(server)) {
      if (!local[d] || e.updatedAt > local[d].updatedAt) merged[d] = e
    }
    markDirty(Object.keys(local).filter(d => !server[d] || local[d].updatedAt > server[d].updatedAt))
    commitRaw(merged)

    if (serverSettings.goal) {
      setSettings(prev => { const next = { ...prev, goal: serverSettings.goal }; save(STORAGE_KEYS.SETTINGS, next); return next })
    } else {
      putSettings(key, { goal: load(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS).goal }).catch(() => {})
    }
  }, [commitRaw])

  const sync = useCallback(async () => {
    const key = keyRef.current
    if (!key) return
    try { await pull(key); await flush() }
    catch (err) { handleSyncError(err) }
  }, [pull, flush, handleSyncError])

  /** 비밀번호 확인 후 저장 (틀리면 에러 throw) */
  const login = useCallback(async (key) => {
    await pull(key)
    keyRef.current = key
    save(STORAGE_KEYS.AUTH, key)
    setAuthKey(key)
    await flush()
  }, [pull, flush])

  // 앱 열 때 / 다시 앞으로 올 때 / 인터넷 다시 연결될 때 동기화
  useEffect(() => {
    const t = setTimeout(sync, 0)
    const onVisible = () => { if (document.visibilityState === 'visible') sync() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', sync)
    return () => {
      clearTimeout(t)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', sync)
    }
  }, [sync])

  // 목표 변경은 오늘 글부터 적용 (지난 글은 쓸 당시 목표 유지)
  const updateGoal = useCallback((goal) => {
    const next = { ...settings, goal }
    setSettings(next); save(STORAGE_KEYS.SETTINGS, next)
    if (keyRef.current) putSettings(keyRef.current, { goal }).catch(() => {})
    const today = getToday()
    if (writings[today]) {
      commitRaw({ ...rawRef.current, [today]: { ...writings[today], goal, updatedAt: new Date().toISOString() } })
      markDirty([today]); scheduleFlush()
    }
  }, [settings, writings, commitRaw, scheduleFlush])

  // ── Writing ──────────────────────────────────────────────────────────────
  // locked: 마감 지난 날짜 (내용만 고치고 점수는 고정)
  const saveWriting = useCallback((date, text, { locked = false } = {}) => {
    const prev = writings[date]
    const updatedAt = new Date().toISOString()
    let entry
    if (locked) {
      const scored = prev ? scoredChars(prev) : 0
      const goal   = prev?.goal ?? settings.goal
      entry = text.trim() || scored > 0
        ? { text, goal, updatedAt, scoredChars: scored }
        : { text: '', goal, updatedAt, deleted: true }
    } else {
      entry = text.trim()
        ? { text, goal: settings.goal, updatedAt }
        : { text: '', goal: settings.goal, updatedAt, deleted: true }
    }
    const nextRaw = { ...rawRef.current, [date]: entry }
    commitRaw(nextRaw)
    markDirty([date]); scheduleFlush()

    const before = deriveGame(writings)
    const nextVisible = visibleOf(nextRaw)
    const after  = deriveGame(nextVisible)

    if (!isDone(prev) && isDone(nextVisible[date])) {
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
  }, [writings, settings.goal, showToast, commitRaw, scheduleFlush])

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
    const data = { version: '2.0-writing', exportedAt: new Date().toISOString(), writings: visibleOf(rawRef.current), settings: load(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS) }
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
          // 가져온 글이 현재 기기·서버 글을 덮어쓰도록 지금 시각으로 저장
          const now = new Date().toISOString()
          const next = { ...rawRef.current }
          for (const d of Object.keys(next)) if (!data.writings[d]) next[d] = { text: '', goal: next[d].goal, updatedAt: now, deleted: true }
          for (const [d, w] of Object.entries(data.writings)) next[d] = { text: w.text, goal: w.goal, updatedAt: now }
          commitRaw(next); markDirty(Object.keys(next)); scheduleFlush()
          if (data.settings) { const s = { ...DEFAULT_SETTINGS, ...data.settings }; save(STORAGE_KEYS.SETTINGS, s); setSettings(s) }
          resolve(data)
        } catch { reject(new Error('잘못된 파일 형식이에요')) }
      }
      reader.onerror = () => reject(new Error('파일을 읽을 수 없어요'))
      reader.readAsText(file)
    })
  }, [commitRaw, scheduleFlush])

  /** 모든 글 삭제 (서버에도 삭제 반영) */
  const resetAllData = useCallback(() => {
    const now = new Date().toISOString()
    const next = Object.fromEntries(Object.entries(rawRef.current).map(([d, e]) => [d, { text: '', goal: e.goal, updatedAt: now, deleted: true }]))
    commitRaw(next); markDirty(Object.keys(next)); scheduleFlush()
  }, [commitRaw, scheduleFlush])

  return {
    writings, saveWriting,
    settings, updateGoal,
    gameState,
    getCreatureStage, getCurrentStreak, getStreakMultiplier, getTodayRate,
    authKey, login, logout, syncStatus, sync,
    darkMode, toggleDarkMode,
    notifSettings, updateNotifSettings,
    toasts, showToast,
    evolutionAlert, showConfetti,
    exportData, importData,
    resetAllData,
  }
}
