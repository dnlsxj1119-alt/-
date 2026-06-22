import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CreatureDisplay from '../components/CreatureDisplay'
import HabitItem from '../components/HabitItem'
import HabitForm from '../components/HabitForm'
import OptionSelectModal from '../components/OptionSelectModal'
import ProgressBar from '../components/ProgressBar'
import { getToday, formatFull } from '../utils/dateUtils'

function MultiplierBadge({ multiplier }) {
  if (multiplier <= 1) return null
  return (
    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">x{multiplier}</span>
  )
}

function HabitSection({ title, titleColor, habits, todayLogs, onCheck, onUncheck, info, groupByCategory = false }) {
  if (!habits.length) return null

  const checked = habits.filter(h => todayLogs[h.id])

  const renderItem = (h) => {
    const logEntry = todayLogs[h.id]
    const sel = Array.isArray(logEntry) ? logEntry : []
    const done = !!todayLogs[h.id]
    return (
      <HabitItem key={h.id} habit={h} isChecked={done} selectedOptions={sel}
        onToggle={() => done ? onUncheck(h) : onCheck(h)} />
    )
  }

  // Group by category (core habits only)
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
                {grouped[cat].filter(h => !todayLogs[h.id]).map(renderItem)}
                {grouped[cat].filter(h =>  todayLogs[h.id]).map(renderItem)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {habits.filter(h => !todayLogs[h.id]).map(renderItem)}
          {habits.filter(h =>  todayLogs[h.id]).map(renderItem)}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [formOpen,      setFormOpen]      = useState(false)
  const [optionTarget,  setOptionTarget]  = useState(null)
  const {
    habits, addHabit, checkHabit, uncheckHabit,
    getTodayLogs, getCoreCompletionRate, getTodayExp,
    getCurrentStreak, getStreakMultiplier, getCreatureStage,
    getCoreHabits, getLifeHabits,
    showToast,
  } = useApp()

  const todayLogs  = getTodayLogs()
  const coreRate   = getCoreCompletionRate()
  const todayExp   = getTodayExp()
  const streak     = getCurrentStreak()
  const multiplier = getStreakMultiplier(streak)
  const creature   = getCreatureStage()
  const today      = getToday()

  const coreHabits = getCoreHabits()
  const lifeHabits = getLifeHabits()
  const allDone    = habits.length > 0 && habits.every(h => todayLogs[h.id])
  const coreDone   = coreHabits.every(h => todayLogs[h.id])

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
    if (habit.options?.length > 0) { setOptionTarget(habit); return }
    fireToast(checkHabit(habit))
  }

  const handleOptionConfirm = (selectedOptions) => {
    const habit = optionTarget; setOptionTarget(null)
    fireToast(checkHabit(habit, selectedOptions))
  }

  const handleUncheck = (habit) => uncheckHabit(habit)

  const handleAddHabit = (data) => {
    addHabit(data); showToast('✅ 습관이 추가되었어요', 'success'); setFormOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 pt-6 pb-28">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{formatFull(today)}</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">오늘의 습관</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full">
          <span className="text-base">🔥</span>
          <span className="text-sm font-bold">{streak}일</span>
          <MultiplierBadge multiplier={multiplier} />
        </div>
      </div>

      {/* Creature card */}
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

            {/* HP bar (core habits only) */}
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
                  코어 {coreHabits.filter(h => todayLogs[h.id]).length}/{coreHabits.length} 완료
                  {lifeHabits.length > 0 && (
                    <span className="ml-2 text-emerald-500">· 라이프 {lifeHabits.filter(h => todayLogs[h.id]).length}/{lifeHabits.length}</span>
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
          {/* Core habits */}
          <HabitSection
            title="⚡ 코어 습관"
            titleColor="text-violet-500 dark:text-violet-400"
            habits={coreHabits}
            todayLogs={todayLogs}
            onCheck={handleCheck}
            onUncheck={handleUncheck}
            groupByCategory
          />

          {/* Life habits */}
          <HabitSection
            title="🌿 라이프 습관"
            titleColor="text-emerald-600 dark:text-emerald-400"
            habits={lifeHabits}
            todayLogs={todayLogs}
            onCheck={handleCheck}
            onUncheck={handleUncheck}
            info="오늘 하면 서식지 아이템에 가까워져요"
          />
        </div>
      )}

      {/* FAB */}
      {habits.length > 0 && (
        <button onClick={() => setFormOpen(true)}
          className="fixed bottom-24 right-1/2 translate-x-[calc(50%+148px)] flex items-center justify-center bg-violet-500 hover:bg-violet-600 active:scale-90 text-white text-2xl rounded-full shadow-lg shadow-violet-300/50 dark:shadow-violet-900/50 transition-all z-30"
          style={{ width: 52, height: 52 }} aria-label="습관 추가">+</button>
      )}

      {formOpen && <HabitForm onSave={handleAddHabit} onClose={() => setFormOpen(false)} />}
      {optionTarget && <OptionSelectModal habit={optionTarget} onConfirm={handleOptionConfirm} onClose={() => setOptionTarget(null)} />}
    </div>
  )
}
