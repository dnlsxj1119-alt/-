import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CreatureDisplay from '../components/CreatureDisplay'
import ProgressBar from '../components/ProgressBar'
import BadgeGrid from '../components/Badge'
import { CREATURE_STAGES, LIFE_MILESTONES } from '../utils/constants'

// ── Habitat View ─────────────────────────────────────────────────────────────
function HabitatView() {
  const { habitatItems, toggleHabitatItem, getLifeHabits, getLifeMilestoneProgress } = useApp()
  const lifeHabits = getLifeHabits()
  const placed = habitatItems.filter(i => i.placed)

  return (
    <div>
      {/* Nature scene */}
      <div className="bg-gradient-to-b from-sky-100 via-emerald-50 to-green-100 dark:from-sky-950 dark:via-emerald-950 dark:to-green-950 rounded-3xl p-5 mb-4 shadow-sm border border-emerald-100 dark:border-emerald-900 min-h-44 relative overflow-hidden">
        {/* Decorative ground */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-green-200/60 to-transparent dark:from-green-900/60" />
        <div className="absolute bottom-1 left-0 right-0 text-2xl opacity-25 flex justify-around pointer-events-none select-none">
          {'🌿🌱🍃🌿🌱🍃🌿🌱🍃🌿'.split('').map((c, i) => <span key={i}>{c}</span>)}
        </div>

        {/* Placed items */}
        <div className="flex flex-wrap gap-4 justify-center min-h-24 items-center pb-4 relative z-10">
          {placed.length === 0 ? (
            <div className="text-center">
              <p className="text-4xl mb-2 opacity-30">🏡</p>
              <p className="text-xs text-emerald-700/50 dark:text-emerald-400/40">라이프 습관 달성 시 아이템이 언락돼요</p>
            </div>
          ) : (
            placed.map((item, i) => (
              <button
                key={item.id}
                onClick={() => toggleHabitatItem(item.id)}
                style={{ animationDelay: `${i * 0.3}s` }}
                className="flex flex-col items-center gap-1 animate-float hover:scale-110 active:scale-95 transition-transform"
                title={item.name}
              >
                <span className="text-3xl drop-shadow-sm">{item.emoji}</span>
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold bg-white/50 dark:bg-black/30 px-1.5 rounded-full">{item.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Item inventory */}
      {habitatItems.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-4 mb-4 shadow-sm border border-white/50 dark:border-gray-700/50">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">아이템 창고</p>
          <div className="grid grid-cols-4 gap-2">
            {habitatItems.map(item => (
              <button
                key={item.id}
                onClick={() => toggleHabitatItem(item.id)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl transition-all active:scale-95
                  ${item.placed
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-400'
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400 text-center leading-tight">{item.name}</span>
                {item.placed && <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold">배치됨</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Life habit milestone progress */}
      {lifeHabits.length > 0 ? (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-4 shadow-sm border border-white/50 dark:border-gray-700/50">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">🌿 라이프 습관 아이템 진행</p>
          <div className="space-y-4">
            {lifeHabits.map(habit => {
              const milestones = getLifeMilestoneProgress(habit.id)
              return (
                <div key={habit.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{habit.icon}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{habit.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{milestones[0].done}일 달성</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {milestones.map(m => {
                      const itemId   = `${habit.id}_${m.days}`
                      const unlocked = !!habitatItems.find(i => i.id === itemId)
                      return (
                        <div key={m.days}
                          className={`p-2.5 rounded-2xl text-center border transition-colors
                            ${unlocked
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                            }`}
                        >
                          <span className={`text-xl ${!unlocked ? 'grayscale opacity-40' : ''}`}>{habit.icon}</span>
                          <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 mt-1 leading-tight">
                            {m.getName(habit.name).length > 10 ? m.getName(habit.name).slice(0, 9) + '…' : m.getName(habit.name)}
                          </p>
                          {unlocked
                            ? <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">언락!</p>
                            : <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">{m.days}일 ({m.remaining}일 남음)</p>
                          }
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600">
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-sm">라이프 습관을 추가하면 서식지가 채워져요</p>
        </div>
      )}
    </div>
  )
}

// ── Creature Detail View ──────────────────────────────────────────────────────
function CreatureDetail() {
  const { gameState, getCoreCompletionRate, getCurrentStreak, getStreakMultiplier, getCreatureStage } = useApp()

  const coreRate   = getCoreCompletionRate()
  const streak     = getCurrentStreak()
  const multiplier = getStreakMultiplier(streak)
  const totalExp   = gameState.totalExp
  const creature   = getCreatureStage()

  const nextStage    = CREATURE_STAGES.find(s => s.stage === creature.stage + 1)
  const stageMin     = creature.min
  const stageMax     = creature.max === Infinity ? totalExp + 1000 : creature.max
  const stageRange   = stageMax - stageMin
  const stageProgress = stageRange > 0 ? (totalExp - stageMin) / stageRange : 1

  const excellent = coreRate >= 0.8
  const sad       = coreRate < 0.5 && coreRate > 0
  const hp        = Math.round(coreRate * 100)

  return (
    <div className="space-y-4">
      {/* Creature showcase */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/50 dark:border-gray-700/50 flex flex-col items-center">
        <div className="relative mb-4">
          <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 transition-all duration-1000
            ${excellent ? 'bg-violet-400 scale-150' : sad ? 'bg-gray-300 scale-100' : 'bg-purple-300 scale-125'}`} />
          <CreatureDisplay size="lg" completionRate={coreRate} />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-xl text-gray-900 dark:text-white">{creature.name}</span>
          <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 text-xs font-bold px-2 py-0.5 rounded-full">Lv.{creature.stage}</span>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">{creature.desc}</p>

        {/* HP bar */}
        <div className="w-full px-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-red-400">❤️ HP</span>
            <div className="flex-1">
              <ProgressBar
                value={coreRate}
                colorClass={hp >= 80 ? 'bg-gradient-to-r from-pink-400 to-rose-400' : hp >= 50 ? 'bg-rose-400' : 'bg-gray-300 dark:bg-gray-600'}
                height="h-2.5"
              />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{hp}/100</span>
          </div>
        </div>

        <div className={`mt-3 px-4 py-2 rounded-full text-xs font-semibold
          ${excellent ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : sad ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'}`}>
          {excellent ? '✨ 기분 최고!' : sad ? '😔 조금 힘들어요' : '😊 기분 좋아요'}
        </div>
      </div>

      {/* EXP & stage progress */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white/50 dark:border-gray-700/50">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">누적 EXP</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{totalExp.toLocaleString()}</p>
          </div>
          {nextStage ? (
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">다음 진화</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{nextStage.emoji} {nextStage.name}</p>
              <p className="text-xs text-violet-500 font-medium">-{(stageMax - totalExp).toLocaleString()} EXP</p>
            </div>
          ) : <p className="text-xs font-semibold text-yellow-500">👑 최고 단계!</p>}
        </div>
        <ProgressBar value={stageProgress} colorClass="bg-gradient-to-r from-violet-500 to-pink-500" height="h-3" />
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
          <span>{stageMin.toLocaleString()} EXP</span>
          {nextStage && <span>{stageMax.toLocaleString()} EXP</span>}
        </div>
        {/* Stage list */}
        <div className="mt-4 space-y-2">
          {CREATURE_STAGES.map(s => {
            const isCurrent = s.stage === creature.stage
            const isUnlocked = totalExp >= s.min
            return (
              <div key={s.stage} className={`flex items-center gap-3 p-2.5 rounded-xl ${isCurrent ? 'bg-violet-50 dark:bg-violet-900/20' : ''}`}>
                <span className={`text-xl ${!isUnlocked ? 'grayscale opacity-40' : ''}`}>{s.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-semibold ${isCurrent ? 'text-violet-700 dark:text-violet-400' : 'text-gray-700 dark:text-gray-400'}`}>{s.name}</p>
                    {isCurrent && <span className="text-[9px] bg-violet-500 text-white px-1.5 py-0.5 rounded-full font-bold">현재</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {s.max === Infinity ? `${s.min.toLocaleString()} EXP~` : `${s.min.toLocaleString()} ~ ${s.max.toLocaleString()} EXP`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Streak */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white/50 dark:border-gray-700/50">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">스트릭</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">현재 연속</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-500">⭐ {gameState.maxStreak}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">최장 연속</p>
          </div>
        </div>
        <div className={`mt-3 p-3 rounded-2xl text-center ${multiplier >= 2 ? 'bg-orange-100 dark:bg-orange-900/30' : multiplier >= 1.5 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {multiplier >= 2 ? '🎉 EXP 2배 보너스 활성화!' : multiplier >= 1.5 ? '✨ EXP 1.5배 보너스 활성화!' : '기본 EXP 획득 중'}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            {streak < 3 ? `3일 연속 시 1.5배 (${3-streak}일 남음)` : streak < 7 ? `7일 연속 시 2배 (${7-streak}일 남음)` : '최대 보너스 달성!'}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white/50 dark:border-gray-700/50">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">배지</p>
        <BadgeGrid />
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Creature() {
  const [subTab, setSubTab] = useState('creature')

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 pt-6 pb-28">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">크리처</h1>

      {/* Sub-tab */}
      <div className="flex bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-1 mb-5 border border-white/50 dark:border-gray-700/50">
        {[['creature', '🐾 크리처'], ['habitat', '🏡 서식지']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all
              ${subTab === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
              }`}
          >{label}</button>
        ))}
      </div>

      {subTab === 'creature' ? <CreatureDetail /> : <HabitatView />}
    </div>
  )
}
