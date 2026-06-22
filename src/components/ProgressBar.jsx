export default function ProgressBar({ value = 0, colorClass = 'bg-violet-500', height = 'h-2', bgClass = 'bg-gray-100 dark:bg-gray-700' }) {
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)))
  return (
    <div className={`w-full ${height} ${bgClass} rounded-full overflow-hidden`}>
      <div
        className={`h-full ${colorClass} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
