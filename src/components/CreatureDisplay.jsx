import { useApp } from '../context/AppContext'

export default function CreatureDisplay({ size = 'lg', completionRate = 0, isEvolving = false }) {
  const { getCreatureStage } = useApp()
  const creature = getCreatureStage()

  const excellent = completionRate >= 0.8
  const sad       = completionRate < 0.5 && completionRate > 0
  const emoji     = sad ? creature.sadEmoji : creature.emoji

  let animClass
  if (isEvolving)   animClass = 'animate-evolve'
  else if (excellent) animClass = 'animate-happy-bounce'
  else if (sad)       animClass = 'animate-droop'
  else                animClass = 'animate-float'

  if (size === 'sm') {
    return (
      <div className={`text-5xl select-none ${animClass} transition-all leading-none`}>
        {emoji}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Glow halo for excellent state */}
      <div className="relative flex items-center justify-center">
        {excellent && !isEvolving && (
          <div className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)', transform: 'scale(1.8)' }}
          />
        )}
        <div className={`text-8xl select-none ${animClass} relative`}>{emoji}</div>
      </div>

      <div className="text-center">
        <p className="font-bold text-lg text-gray-800 dark:text-white">{creature.name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Lv.{creature.stage}</p>
      </div>
    </div>
  )
}
