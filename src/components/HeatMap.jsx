import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getToday } from '../utils/dateUtils'

const MONTH_LABELS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const DAY_LABELS = ['월','화','수','목','금','토','일']

function getCellColor(rate, darkMode) {
  if (rate === 0)    return darkMode ? 'bg-gray-700' : 'bg-gray-200'
  if (rate < 0.5)   return darkMode ? 'bg-violet-900/70' : 'bg-violet-200'
  if (rate < 0.8)   return darkMode ? 'bg-violet-600'    : 'bg-violet-400'
  return darkMode ? 'bg-violet-400' : 'bg-violet-600'
}

export default function HeatMap() {
  const { logs, habits, darkMode } = useApp()
  const today = getToday()

  const { columns, monthLabels } = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 89)
    start.setHours(0, 0, 0, 0)

    // Monday-based offset (Mon=0 … Sun=6)
    const startDow = (start.getDay() + 6) % 7
    const cells = Array(startDow).fill(null)

    for (let i = 0; i < 90; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLogs = logs[dateStr] || {}
      const checked = Object.values(dayLogs).filter(Boolean).length
      const rate = habits.length > 0 ? checked / habits.length : 0
      cells.push({ date: dateStr, rate, checked, isToday: dateStr === today })
    }
    while (cells.length % 7 !== 0) cells.push(null)

    const cols = []
    for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7))

    // Month labels: first column index where month changes
    const labels = []
    let prev = ''
    cols.forEach((col, ci) => {
      const first = col.find(c => c !== null)
      if (!first) return
      const m = first.date.substring(5, 7)
      if (m !== prev) { prev = m; labels.push({ ci, label: MONTH_LABELS[Number(m) - 1] }) }
    })

    return { columns: cols, monthLabels: labels }
  }, [logs, habits, today])

  return (
    <div className="overflow-x-auto pb-1">
      <div style={{ minWidth: `${columns.length * 14 + 28}px` }}>
        {/* Month labels */}
        <div className="flex ml-7 mb-1">
          {columns.map((_, ci) => {
            const lbl = monthLabels.find(m => m.ci === ci)
            return (
              <div key={ci} className="w-[11px] mr-[3px] text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                {lbl ? lbl.label : ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="w-5 h-[11px] flex items-center justify-end pr-1">
                <span className="text-[9px] text-gray-400 dark:text-gray-500">{i % 2 === 0 ? d : ''}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px] mr-[3px]">
              {col.map((cell, di) => (
                cell
                  ? (
                    <div
                      key={di}
                      title={`${cell.date}: ${Math.round(cell.rate * 100)}%`}
                      className={`w-[11px] h-[11px] rounded-sm transition-colors
                        ${getCellColor(cell.rate, darkMode)}
                        ${cell.isToday ? 'ring-1 ring-violet-400 ring-offset-0' : ''}
                      `}
                    />
                  )
                  : <div key={di} className="w-[11px] h-[11px]" />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-7">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">적음</span>
          {[0, 0.3, 0.6, 0.9].map(r => (
            <div key={r} className={`w-[11px] h-[11px] rounded-sm ${getCellColor(r, darkMode)}`} />
          ))}
          <span className="text-[10px] text-gray-400 dark:text-gray-500">많음</span>
        </div>
      </div>
    </div>
  )
}
