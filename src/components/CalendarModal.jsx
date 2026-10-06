import { useState } from 'react'
import { isDone } from '../hooks/useAppStore'
import { getToday } from '../utils/dateUtils'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const pad = (n) => String(n).padStart(2, '0')
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`

export default function CalendarModal({ writings, selected, onSelect, onClose }) {
  const today = getToday()
  const [y0, m0] = selected.split('-').map(Number)
  const [year,  setYear]  = useState(y0)
  const [month, setMonth] = useState(m0 - 1) // 0-based

  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const isCurrentMonth = ymd(year, month, 1) >= today.slice(0, 8) + '01'
  const move = (delta) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear()); setMonth(d.getMonth())
  }

  const monthEntries = Object.entries(writings).filter(([d]) => d.startsWith(`${year}-${pad(month + 1)}`))
  const monthDone    = monthEntries.filter(([, e]) => isDone(e)).length

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl animate-fade-in">
        {/* Month header */}
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => move(-1)}
            className="w-9 h-9 rounded-full text-xl text-gray-500 hover:bg-violet-50 dark:hover:bg-violet-900/30">‹</button>
          <p className="font-bold text-gray-900 dark:text-white">{year}년 {month + 1}월</p>
          <button onClick={() => move(1)} disabled={isCurrentMonth}
            className="w-9 h-9 rounded-full text-xl text-gray-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 disabled:opacity-30 disabled:cursor-not-allowed">›</button>
        </div>
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mb-4">
          이 달에 {monthEntries.length}일 썼어요{monthDone > 0 && ` · 목표 달성 ${monthDone}일`}
        </p>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d, i) => (
            <p key={d} className={`text-center text-[10px] font-semibold ${i === 0 ? 'text-rose-400' : 'text-gray-400 dark:text-gray-500'}`}>{d}</p>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const date    = ymd(year, month, day)
            const entry   = writings[date]
            const done    = isDone(entry)
            const future  = date > today
            const isSel   = date === selected
            const isToday = date === today
            return (
              <button key={i} disabled={future} onClick={() => { onSelect(date); onClose() }}
                className="flex flex-col items-center py-1 disabled:opacity-25 disabled:cursor-not-allowed">
                <span className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors
                  ${done    ? 'bg-violet-500 text-white font-bold'
                  : entry   ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold'
                  :           'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                  ${isSel   ? 'ring-2 ring-offset-2 ring-violet-400 dark:ring-offset-gray-900' : ''}
                  ${isToday && !isSel ? 'ring-1 ring-violet-300' : ''}`}>
                  {day}
                </span>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-500" />목표 달성</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-100 dark:bg-violet-900/40" />조금 씀</span>
        </div>
      </div>
    </div>
  )
}
