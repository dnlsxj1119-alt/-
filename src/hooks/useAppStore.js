import { useState, useCallback, useEffect } from 'react'
import { DIFFICULTIES, CREATURE_STAGES, BADGES, LIFE_MILESTONES, STORAGE_KEYS } from '../utils/constants'
import { getToday, getYesterday, isYesterday, getLast30Days } from '../utils/dateUtils'

const load = (key, def) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def }
  catch { return def }
}
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val))

const DEFAULT_STATE = { totalExp: 0, streak: 0, maxStreak: 0, lastCheckDate: null, badges: [] }
const DEFAULT_NOTIF = { enabled: false, time: '09:00' }

function stageForExp(exp) {
  return CREATURE_STAGES.find(s => exp <= s.max) || CREATURE_STAGES[CREATURE_STAGES.length - 1]
}

const isCore = (h) => (h.type || 'core') === 'core'
const isLife = (h) => h.type === 'life'

export function useAppStore() {
  const [habits,         setHabits]         = useState(() => load(STORAGE_KEYS.HABITS, []))
  const [logs,           setLogs]           = useState(() => load(STORAGE_KEYS.LOGS, {}))
  const [gameState,      setGameState]      = useState(() => load(STORAGE_KEYS.GAME_STATE, DEFAULT_STATE))
  const [habitatItems,   setHabitatItems]   = useState(() => load(STORAGE_KEYS.HABITAT, []))
  const [darkMode,       setDarkMode]       = useState(() => load(STORAGE_KEYS.DARK_MODE, false))
  const [notifSettings,  setNotifSettings]  = useState(() => load('hg_notif', DEFAULT_NOTIF))
  const [toasts,         setToasts]         = useState([])
  const [evolutionAlert, setEvolutionAlert] = useState(null)
  const [showConfetti,   setShowConfetti]   = useState(false)

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
    setNotifSettings(s); save('hg_notif', s)
  }, [])

  // ── Habit CRUD ────────────────────────────────────────────────────────────
  const addHabit = useCallback((data) => {
    const h = { ...data, id: String(Date.now()), createdAt: new Date().toISOString() }
    const next = [...habits, h]
    save(STORAGE_KEYS.HABITS, next); setHabits(next)
    return h
  }, [habits])

  const updateHabit = useCallback((id, updates) => {
    const next = habits.map(h => h.id === id ? { ...h, ...updates } : h)
    save(STORAGE_KEYS.HABITS, next); setHabits(next)
  }, [habits])

  const deleteHabit = useCallback((id) => {
    const next = habits.filter(h => h.id !== id)
    save(STORAGE_KEYS.HABITS, next); setHabits(next)
  }, [habits])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getStreakMultiplier = (streak) => streak >= 7 ? 2.0 : streak >= 3 ? 1.5 : 1.0

  const getCurrentStreak = useCallback(() => {
    const today = getToday(); const yesterday = getYesterday()
    return (gameState.lastCheckDate === today || gameState.lastCheckDate === yesterday) ? gameState.streak : 0
  }, [gameState])

  const getTodayLogs    = useCallback(() => logs[getToday()] || {}, [logs])
  const getCoreHabits   = useCallback(() => habits.filter(isCore), [habits])
  const getLifeHabits   = useCallback(() => habits.filter(isLife), [habits])

  /** Core-only completion rate (drives creature HP / mood) */
  const getCoreCompletionRate = useCallback(() => {
    const core = habits.filter(isCore)
    if (!core.length) return 0
    const tl = logs[getToday()] || {}
    return core.filter(h => tl[h.id]).length / core.length
  }, [habits, logs])

  /** Alias for backwards-compat (creature display uses this) */
  const getTodayCompletionRate = getCoreCompletionRate

  /** How many total days a life habit was ever completed */
  const getLifeHabitDays = useCallback((habitId) => {
    return Object.values(logs).filter(dl => dl[habitId]).length
  }, [logs])

  /** Life habit progress toward each milestone */
  const getLifeMilestoneProgress = useCallback((habitId) => {
    const done = getLifeHabitDays(habitId)
    return LIFE_MILESTONES.map(m => ({
      ...m,
      done,
      reached: done >= m.days,
      remaining: Math.max(0, m.days - done),
    }))
  }, [getLifeHabitDays])

  const getTodayExp = useCallback(() => {
    const tl = logs[getToday()] || {}
    const m  = getStreakMultiplier(gameState.streak)
    return habits.filter(isCore).reduce(
      (s, h) => tl[h.id] ? s + Math.floor((DIFFICULTIES[h.difficulty]?.exp ?? 10) * m) : s, 0
    )
  }, [habits, logs, gameState.streak])

  // ── checkHabit ───────────────────────────────────────────────────────────
  const checkHabit = useCallback((habit, selectedOptions = null) => {
    const today    = getToday()
    const todayLogs = logs[today] || {}
    if (todayLogs[habit.id]) return null

    const logValue = selectedOptions?.length > 0 ? selectedOptions : true
    const nextLogs = { ...logs, [today]: { ...todayLogs, [habit.id]: logValue } }

    // ── Life habit: only milestone check ──────────────────────────────────
    if (isLife(habit)) {
      const daysBefore = getLifeHabitDays(habit.id)
      const daysAfter  = daysBefore + 1

      const newItems = [...habitatItems]
      let newItem = null
      LIFE_MILESTONES.forEach(m => {
        if (daysBefore < m.days && daysAfter >= m.days) {
          const itemId = `${habit.id}_${m.days}`
          if (!habitatItems.find(i => i.id === itemId)) {
            const item = { id: itemId, habitId: habit.id, milestone: m.days, emoji: habit.icon, name: m.getName(habit.name), placed: false, unlockedAt: today }
            newItems.push(item)
            newItem = item
          }
        }
      })

      save(STORAGE_KEYS.LOGS, nextLogs)
      save(STORAGE_KEYS.HABITAT, newItems)
      setLogs(nextLogs)
      setHabitatItems(newItems)
      return { earnedExp: 0, multiplier: 1, earnedBadge: null, newStreak: gameState.streak, newItem, isLife: true }
    }

    // ── Core habit: EXP + streak ──────────────────────────────────────────
    // Only core habits affect streak
    const coreLogsToday = Object.entries(todayLogs).filter(([id]) => habits.find(h => h.id === id && isCore(h)))
    const isFirstCoreToday = coreLogsToday.length === 0

    let newStreak = gameState.streak
    if (isFirstCoreToday) {
      const lcd = gameState.lastCheckDate
      if (!lcd || (!isYesterday(lcd) && lcd !== today)) newStreak = 1
      else if (isYesterday(lcd)) newStreak = gameState.streak + 1
    }

    const multiplier   = getStreakMultiplier(newStreak)
    const baseExp      = DIFFICULTIES[habit.difficulty]?.exp ?? 10
    const earnedExp    = Math.floor(baseExp * multiplier)
    const newTotalExp  = gameState.totalExp + earnedExp
    const newMaxStreak = Math.max(gameState.maxStreak, newStreak)

    // Evolution check
    const oldStage = stageForExp(gameState.totalExp)
    const newStage = stageForExp(newTotalExp)
    if (newStage.stage > oldStage.stage) {
      setTimeout(() => {
        setEvolutionAlert({ from: oldStage, to: newStage })
        setTimeout(() => setEvolutionAlert(null), 3200)
      }, 400)
    }

    // Streak-7 confetti
    if (gameState.streak < 7 && newStreak >= 7) {
      setTimeout(() => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5500) }, 600)
    }

    // Badges
    const existingIds = new Set(gameState.badges.map(b => b.id))
    const newBadges = [...gameState.badges]
    let earnedBadge = null
    BADGES.forEach(b => {
      if (!existingIds.has(b.id) && newStreak >= b.requiredStreak) {
        newBadges.push({ ...b, earnedAt: today }); earnedBadge = b
      }
    })

    const nextState = { ...gameState, totalExp: newTotalExp, streak: newStreak, maxStreak: newMaxStreak, lastCheckDate: today, badges: newBadges }
    save(STORAGE_KEYS.LOGS, nextLogs); save(STORAGE_KEYS.GAME_STATE, nextState)
    setLogs(nextLogs); setGameState(nextState)

    return { earnedExp, multiplier, earnedBadge, newStreak, isLife: false }
  }, [logs, gameState, habits, habitatItems, getLifeHabitDays])

  const uncheckHabit = useCallback((habit) => {
    const today     = getToday()
    const todayLogs = { ...logs[today] || {} }
    if (!todayLogs[habit.id]) return

    delete todayLogs[habit.id]
    const nextLogs = { ...logs, [today]: todayLogs }

    // Core: subtract EXP
    if (isCore(habit)) {
      const m         = getStreakMultiplier(gameState.streak)
      const earnedExp = Math.floor((DIFFICULTIES[habit.difficulty]?.exp ?? 10) * m)
      const nextState = { ...gameState, totalExp: Math.max(0, gameState.totalExp - earnedExp) }
      save(STORAGE_KEYS.GAME_STATE, nextState); setGameState(nextState)
    }

    save(STORAGE_KEYS.LOGS, nextLogs); setLogs(nextLogs)
  }, [logs, gameState, habits])

  // ── Past log edit (no EXP change) ────────────────────────────────────────
  const setPastLog = useCallback((date, habitId, value) => {
    const dayLogs = { ...(logs[date] || {}) }
    if (value) dayLogs[habitId] = value
    else delete dayLogs[habitId]
    const nextLogs = { ...logs, [date]: dayLogs }
    save(STORAGE_KEYS.LOGS, nextLogs)
    setLogs(nextLogs)
  }, [logs])

  // ── Habitat ───────────────────────────────────────────────────────────────
  const toggleHabitatItem = useCallback((itemId) => {
    const next = habitatItems.map(i => i.id === itemId ? { ...i, placed: !i.placed } : i)
    save(STORAGE_KEYS.HABITAT, next); setHabitatItems(next)
  }, [habitatItems])

  // ── Derived ───────────────────────────────────────────────────────────────
  const getCreatureStage = useCallback((exp = gameState.totalExp) => stageForExp(exp), [gameState.totalExp])

  const getHabitStats = useCallback(() => {
    const last30 = getLast30Days()
    return habits.map(h => {
      const done = last30.filter(d => logs[d]?.[h.id]).length
      return { ...h, rate: done / 30, doneCount: done }
    }).sort((a, b) => b.rate - a.rate)
  }, [habits, logs])

  const getTotalCompletions = useCallback(() =>
    Object.values(logs).reduce((s, dl) => s + Object.values(dl).filter(Boolean).length, 0)
  , [logs])

  // ── Export / Import ───────────────────────────────────────────────────────
  const exportData = useCallback(() => {
    const data = { version: '1.0', exportedAt: new Date().toISOString(), habits: load(STORAGE_KEYS.HABITS, []), logs: load(STORAGE_KEYS.LOGS, {}), gameState: load(STORAGE_KEYS.GAME_STATE, DEFAULT_STATE), habitat: load(STORAGE_KEYS.HABITAT, []) }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `habit-creature-${getToday()}.json`; a.click(); URL.revokeObjectURL(url)
  }, [])

  const importData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (!Array.isArray(data.habits) || typeof data.logs !== 'object' || typeof data.gameState !== 'object') throw new Error('invalid')
          save(STORAGE_KEYS.HABITS, data.habits); save(STORAGE_KEYS.LOGS, data.logs); save(STORAGE_KEYS.GAME_STATE, data.gameState)
          if (data.habitat) save(STORAGE_KEYS.HABITAT, data.habitat)
          setHabits(data.habits); setLogs(data.logs); setGameState(data.gameState)
          if (data.habitat) setHabitatItems(data.habitat)
          resolve(data)
        } catch { reject(new Error('잘못된 파일 형식이에요')) }
      }
      reader.onerror = () => reject(new Error('파일을 읽을 수 없어요'))
      reader.readAsText(file)
    })
  }, [])

  const resetAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
    setHabits([]); setLogs({}); setGameState(DEFAULT_STATE); setHabitatItems([])
  }, [])

  return {
    habits, addHabit, updateHabit, deleteHabit,
    logs, gameState,
    habitatItems, toggleHabitatItem,
    setPastLog,
    checkHabit, uncheckHabit,
    getCreatureStage, getTodayLogs,
    getCoreHabits, getLifeHabits,
    getTodayCompletionRate, getCoreCompletionRate,
    getTodayExp, getCurrentStreak, getStreakMultiplier,
    getLifeHabitDays, getLifeMilestoneProgress,
    getHabitStats, getTotalCompletions,
    darkMode, toggleDarkMode,
    notifSettings, updateNotifSettings,
    toasts, showToast,
    evolutionAlert, showConfetti,
    exportData, importData,
    resetAllData,
  }
}
