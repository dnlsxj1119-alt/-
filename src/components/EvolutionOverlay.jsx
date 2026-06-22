export default function EvolutionOverlay({ event }) {
  if (!event) return null
  const { from, to } = event

  return (
    <div className="fixed inset-0 z-[55] flex flex-col items-center justify-center pointer-events-none">
      {/* White flash background */}
      <div className="absolute inset-0 bg-white dark:bg-violet-950 animate-evolve-bg" />

      {/* Glow ring */}
      <div
        className="absolute rounded-full animate-evolve-glow"
        style={{ width: 240, height: 240, background: 'radial-gradient(circle, rgba(167,139,250,0.6) 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-4 z-10">
        <div className="text-[96px] leading-none animate-evolve select-none">
          {to.emoji}
        </div>
        <div className="text-center px-6 py-3 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl">
          <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-1">진화!</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {from.name} <span className="text-violet-400">→</span> {to.name}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{to.desc}</p>
        </div>
      </div>
    </div>
  )
}
