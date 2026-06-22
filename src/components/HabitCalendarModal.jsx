import { useState } from 'react'
import { getToday } from '../utils/dateUtils'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

export default function HabitCalendarModal({ habit, logs, onClose }) {
  const today = getToday()
  const [ym, setYm] = useState(today.slice(0, 7))

  const [year, month] = ym.split('-').map(Number)
  const daysInMonth   = new Date(year, month, 0).getDate()
  const firstDayRaw   = new Date(year, month - 1, 1).getDay() // 0=Sun
  const startPad      = (firstDayRaw + 6) % 7                 // Mon-based padding

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d       = String(i + 1).padStart(2, '0')
    const dateStr = `${ym}-${d}`
    return { day: i + 1, dateStr, done: !!logs[dateStr]?.[habit.id], isFuture: dateStr > today }
  })

  const doneDays = days.filter(d => d.done).length
  const pastDays = days.filter(d => !d.isFuture).length
  const rate     = pastDays > 0 ? Math.round((doneDays / pastDays) * 100) : 0

  const go = (delta) => {
    const d = new Date(year, month - 1 + delta, 1)
    setYm(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const isCurrentMonth = ym === today.slice(0, 7)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-2xl animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.icon}</span>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{habit.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">월별 달성 현황</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-bold">✕</button>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => go(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">‹</button>
          <p className="text-sm font-bold text-gray-800 dark:text-white">{year}년 {month}월</p>
          <button onClick={() => go(1)} disabled={isCurrentMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">›</button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(l => (
            <div key={l} className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 py-1">{l}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: startPad }, (_, i) => <div key={`pad-${i}`} />)}
          {days.map(({ day, dateStr, done, isFuture }) => (
            <div key={dateStr}
              className={`flex flex-col items-center justify-center h-9 rounded-xl transition-colors
                ${done ? 'bg-violet-100 dark:bg-violet-900/30' : ''}
                ${dateStr === today ? 'ring-2 ring-violet-400' : ''}
              `}
            >
              {done ? (
                <span className="text-lg leading-none">{habit.icon}</span>
              ) : (
                <span className={`text-xs font-medium ${isFuture ? 'text-gray-200 dark:text-gray-700' : 'text-gray-400 dark:text-gray-500'}`}>{day}</span>
              )}
            </div>
          ))}
        </div>

        {/* Monthly rate */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">{month}월 달성률</p>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-700"
                style={{ width: `${rate}%` }} />
            </div>
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{rate}%</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-right mt-1">{doneDays}일 달성 / {pastDays}일 경과</p>
      </div>
    </div>
  )
}
