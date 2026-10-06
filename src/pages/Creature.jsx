import { useApp } from '../context/AppContext'
import CreatureDisplay from '../components/CreatureDisplay'
import ProgressBar from '../components/ProgressBar'
import BadgeGrid from '../components/Badge'
import { CREATURE_STAGES } from '../utils/constants'

// ── Creature Detail View ──────────────────────────────────────────────────────
function CreatureDetail() {
  const { gameState, getTodayRate, getCurrentStreak, getCreatureStage } = useApp()

  const coreRate   = getTodayRate()
  const streak     = getCurrentStreak()
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
            <span className="text-xs font-bold text-red-400">✍️ 오늘</span>
            <div className="flex-1">
              <ProgressBar
                value={coreRate}
                colorClass={hp >= 80 ? 'bg-gradient-to-r from-pink-400 to-rose-400' : hp >= 50 ? 'bg-rose-400' : 'bg-gray-300 dark:bg-gray-600'}
                height="h-2.5"
              />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{hp}%</span>
          </div>
        </div>

        <div className={`mt-3 px-4 py-2 rounded-full text-xs font-semibold
          ${excellent ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : sad ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'}`}>
          {excellent ? '✨ 오늘 글 덕분에 기분 최고!' : sad ? '😔 글이 더 필요해요' : coreRate === 0 ? '✍️ 오늘 글을 기다리고 있어요' : '😊 기분 좋아요'}
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
        <div className="mt-3 p-3 rounded-2xl text-center bg-gray-50 dark:bg-gray-700/50">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">연속 3·7·14·21·30·60·100일째엔 보너스 EXP</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">하루 목표 글자 수를 채우면 연속 기록이 이어져요</p>
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 pt-6 pb-28">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">크리처</h1>
      <CreatureDetail />
    </div>
  )
}
