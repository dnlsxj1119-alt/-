import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import CreatureDisplay from '../components/CreatureDisplay'
import HabitItem from '../components/HabitItem'
import HabitForm from '../components/HabitForm'
import OptionSelectModal from '../components/OptionSelectModal'
import ProgressBar from '../components/ProgressBar'
import { getToday, formatFull } from '../utils/dateUtils'

// ── Gratitude helpers ─────────────────────────────────────────────────────────
const GRATITUDE_KEY = 'hg_gratitude'
const loadGratitude = () => { try { return JSON.parse(localStorage.getItem(GRATITUDE_KEY) || '{}') } catch { return {} } }
const saveGratitude = (data) => localStorage.setItem(GRATITUDE_KEY, JSON.stringify(data))

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const getDayLabel = (dateStr) => DAYS[new Date(dateStr + 'T00:00:00').getDay()]

// ── Gratitude Entry (single date) ─────────────────────────────────────────────
function GratitudeEntry({ date }) {
  const [all,     setAll]     = useState(() => loadGratitude())
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState('')
  const textRef = useRef(null)

  useEffect(() => { setEditing(false); setDraft('') }, [date])

  const content = all[date] || ''

  const startEdit = () => {
    setDraft(content)
    setEditing(true)
    setTimeout(() => textRef.current?.focus(), 50)
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    const next = { ...all }
    if (trimmed) next[date] = trimmed
    else delete next[date]
    saveGratitude(next)
    setAll(next)
    setEditing(false)
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl px-4 py-3.5 shadow-sm border border-white/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-amber-600 dark:text-amber-400">🙏 감사 한 줄</p>
        {content && !editing && (
          <button onClick={startEdit} className="text-[10px] text-gray-400 hover:text-violet-500 transition-colors">수정</button>
        )}
      </div>
      {editing ? (
        <div>
          <textarea ref={textRef} value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="감사한 일을 한 줄로 적어보세요" maxLength={100} rows={2}
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          <div className="flex gap-2 mt-2">
            <button onClick={() => { setEditing(false); setDraft('') }}
              className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-semibold">취소</button>
            <button onClick={handleSave}
              className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold transition-all">저장</button>
          </div>
        </div>
      ) : content ? (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>
      ) : (
        <button onClick={startEdit}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-900/40 text-amber-400 text-xs font-medium hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all">
          + 감사한 일 적기
        </button>
      )}
    </div>
  )
}

// ── Habit Section ─────────────────────────────────────────────────────────────
function HabitSection({ title, titleColor, habits, viewLogs, onCheck, onUncheck, info, groupByCategory = false }) {
  if (!habits.length) return null

  const checked = habits.filter(h => viewLogs[h.id])

  const renderItem = (h) => {
    const logEntry = viewLogs[h.id]
    const sel  = Array.isArray(logEntry) ? logEntry : []
    const done = !!viewLogs[h.id]
    return (
      <HabitItem key={h.id} habit={h} isChecked={done} selectedOptions={sel}
        onToggle={() => done ? onUncheck(h) : onCheck(h)} />
    )
  }

  const grouped = {}
  if (groupByCategory) {
    habits.forEach(h => {
      const cat = h.category || '기타'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(h)
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <p className={`text-xs font-bold uppercase tracking-wider ${titleColor}`}>{title}</p>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{checked.length}/{habits.length}</span>
      </div>
      {info && <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/60 px-1 mb-2">{info}</p>}
      {groupByCategory ? (
        <div className="space-y-4">
          {Object.keys(grouped).map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-1.5">{cat}</p>
              <div className="space-y-2">
                {grouped[cat].filter(h => !viewLogs[h.id]).map(renderItem)}
                {grouped[cat].filter(h =>  viewLogs[h.id]).map(renderItem)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {habits.filter(h => !viewLogs[h.id]).map(renderItem)}
          {habits.filter(h =>  viewLogs[h.id]).map(renderItem)}
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const today = getToday()
  const [viewDate,     setViewDate]     = useState(today)
  const [formOpen,     setFormOpen]     = useState(false)
  const [optionTarget, setOptionTarget] = useState(null)

  const isPast = viewDate !== today

  const {
    habits, logs, addHabit, checkHabit, uncheckHabit, setPastLog,
    getCoreCompletionRate, getTodayExp,
    getCurrentStreak, getStreakMultiplier, getCreatureStage,
    getCoreHabits, getLifeHabits,
    showToast,
  } = useApp()

  // Always current (today) for creature card
  const coreRate   = getCoreCompletionRate()
  const todayExp   = getTodayExp()
  const streak     = getCurrentStreak()
  const multiplier = getStreakMultiplier(streak)
  const creature   = getCreatureStage()

  const coreHabits = getCoreHabits()
  const lifeHabits = getLifeHabits()

  // Logs for the viewed date
  const viewLogs = logs[viewDate] || {}
  const allDone  = habits.length > 0 && habits.every(h => viewLogs[h.id])
  const coreDone = coreHabits.every(h => viewLogs[h.id])

  // Date navigation
  const goBack = () => {
    const d = new Date(viewDate + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    setViewDate(d.toISOString().split('T')[0])
  }
  const goForward = () => {
    if (!isPast) return
    const d = new Date(viewDate + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    setViewDate(d.toISOString().split('T')[0])
  }

  // Habit toggle handlers
  const fireToast = (result) => {
    if (!result) return
    if (result.isLife) {
      if (result.newItem) showToast(`🏡 아이템 언락! ${result.newItem.emoji} ${result.newItem.name}`, 'badge')
      else showToast('🌿 라이프 습관 완료!', 'success')
      return
    }
    const { earnedExp, multiplier: m, earnedBadge } = result
    if (earnedBadge) setTimeout(() => showToast(`🏅 배지 획득! ${earnedBadge.emoji} ${earnedBadge.name}`, 'badge'), 200)
    if (m >= 2)        showToast(`🔥 +${earnedExp} EXP (x${m} 보너스!)`, 'streak')
    else if (m >= 1.5) showToast(`✨ +${earnedExp} EXP (x${m} 보너스!)`, 'streak')
    else               showToast(`+${earnedExp} EXP`, 'exp')
  }

  const handleCheck = (habit) => {
    if (isPast) { setPastLog(viewDate, habit.id, true); return }
    if (habit.options?.length > 0) { setOptionTarget(habit); return }
    fireToast(checkHabit(habit))
  }
  const handleUncheck = (habit) => {
    if (isPast) { setPastLog(viewDate, habit.id, false); return }
    uncheckHabit(habit)
  }
  const handleOptionConfirm = (selectedOptions) => {
    const habit = optionTarget; setOptionTarget(null)
    fireToast(checkHabit(habit, selectedOptions))
  }
  const handleAddHabit = (data) => {
    addHabit(data); showToast('✅ 습관이 추가되었어요', 'success'); setFormOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 pt-6 pb-28">

      {/* Date navigation header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={goBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 shadow-sm hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-xl font-light flex-shrink-0">
          ‹
        </button>
        <div className="flex-1 min-w-0 text-center">
          <p className={`text-[10px] font-semibold ${isPast ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {isPast ? '과거 기록' : '오늘'}
          </p>
          <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
            {formatFull(viewDate)} ({getDayLabel(viewDate)})
          </h1>
        </div>
        <button onClick={goForward} disabled={!isPast}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 shadow-sm hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-xl font-light flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed">
          ›
        </button>
        {!isPast && (
          <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1.5 rounded-full flex-shrink-0">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold">{streak}일</span>
            {multiplier > 1 && <span className="text-[10px] font-bold">x{multiplier}</span>}
          </div>
        )}
      </div>

      {/* Past mode notice */}
      {isPast && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="text-sm">📝</span>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">기록 수정 중 · EXP 변동 없이 체크만 바뀌어요</p>
          <button onClick={() => setViewDate(today)}
            className="ml-auto text-[10px] text-blue-500 dark:text-blue-400 font-bold underline">오늘로</button>
        </div>
      )}

      {/* Creature card (today only) */}
      {!isPast && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-4 mb-5 shadow-sm border border-white/50 dark:border-gray-700/50">
          <div className="flex items-center gap-4">
            <CreatureDisplay size="sm" completionRate={coreRate} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{creature.name}</span>
                  <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">Lv.{creature.stage}</span>
                </div>
                {coreHabits.length > 0 && (
                  <span className="text-sm font-bold text-violet-600 dark:text-violet-400">+{todayExp} EXP</span>
                )}
              </div>
              {coreHabits.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-semibold text-red-400">HP</span>
                    <ProgressBar
                      value={coreRate}
                      colorClass={coreRate >= 0.8 ? 'bg-gradient-to-r from-pink-400 to-rose-400' : coreRate >= 0.5 ? 'bg-rose-400' : 'bg-gray-300 dark:bg-gray-600'}
                      height="h-2"
                    />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">{Math.round(coreRate * 100)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500">
                    코어 {coreHabits.filter(h => viewLogs[h.id]).length}/{coreHabits.length} 완료
                    {lifeHabits.length > 0 && (
                      <span className="ml-2 text-emerald-500">· 라이프 {lifeHabits.filter(h => viewLogs[h.id]).length}/{lifeHabits.length}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {allDone && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-center animate-fade-in">
              <p className="text-sm font-bold text-violet-600 dark:text-violet-400">🎉 오늘 모든 습관 완료!</p>
            </div>
          )}
          {!allDone && coreDone && coreHabits.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-center animate-fade-in">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">⚡ 코어 습관 완료! 크리처가 기뻐해요</p>
            </div>
          )}
        </div>
      )}

      {/* Habits */}
      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <span className="text-6xl mb-4">🌱</span>
          <p className="font-semibold text-gray-600 dark:text-gray-400">아직 습관이 없어요</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1 mb-5">첫 번째 습관을 추가해보세요!</p>
          <button onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 active:scale-95 text-white font-semibold px-5 py-3 rounded-2xl transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/30">
            <span className="text-lg leading-none">+</span>습관 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <HabitSection
            title="⚡ 코어 습관"
            titleColor="text-violet-500 dark:text-violet-400"
            habits={coreHabits}
            viewLogs={viewLogs}
            onCheck={handleCheck}
            onUncheck={handleUncheck}
            groupByCategory
          />
          <HabitSection
            title="🌿 라이프 습관"
            titleColor="text-emerald-600 dark:text-emerald-400"
            habits={lifeHabits}
            viewLogs={viewLogs}
            onCheck={handleCheck}
            onUncheck={handleUncheck}
            info={!isPast ? '오늘 하면 서식지 아이템에 가까워져요' : undefined}
          />
        </div>
      )}

      {/* Gratitude entry for current view date */}
      <div className="mt-6">
        <GratitudeEntry date={viewDate} />
      </div>

      {/* FAB — today only */}
      {!isPast && habits.length > 0 && (
        <button onClick={() => setFormOpen(true)}
          className="fixed bottom-24 right-1/2 translate-x-[calc(50%+148px)] flex items-center justify-center bg-violet-500 hover:bg-violet-600 active:scale-90 text-white text-2xl rounded-full shadow-lg shadow-violet-300/50 dark:shadow-violet-900/50 transition-all z-30"
          style={{ width: 52, height: 52 }} aria-label="습관 추가">+</button>
      )}

      {formOpen && <HabitForm onSave={handleAddHabit} onClose={() => setFormOpen(false)} />}
      {optionTarget && <OptionSelectModal habit={optionTarget} onConfirm={handleOptionConfirm} onClose={() => setOptionTarget(null)} />}
    </div>
  )
}
