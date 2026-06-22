import { BADGES } from '../utils/constants'
import { useApp } from '../context/AppContext'

export default function BadgeGrid() {
  const { gameState } = useApp()
  const earned = new Set(gameState.badges.map(b => b.id))

  return (
    <div className="grid grid-cols-3 gap-3">
      {BADGES.map(badge => {
        const isEarned = earned.has(badge.id)
        return (
          <div
            key={badge.id}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all
              ${isEarned
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 opacity-50 grayscale'
              }`}
          >
            <span className="text-2xl">{badge.emoji}</span>
            <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">
              {badge.name}
            </p>
            {isEarned && (
              <span className="text-[9px] text-yellow-600 dark:text-yellow-400 font-medium">획득!</span>
            )}
            {!isEarned && (
              <span className="text-[9px] text-gray-400 dark:text-gray-600">{badge.requiredStreak}일 연속</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
