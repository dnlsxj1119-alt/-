import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { countChars } from '../hooks/useAppStore'
import HeatMap from '../components/HeatMap'
import { getToday, formatFull } from '../utils/dateUtils'

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400',
  }
  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
      {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  )
}

function WritingCard({ date, entry, open, onToggle, cardRef }) {
  const chars = countChars(entry.text)
  const done  = chars >= entry.goal
  return (
    <div ref={cardRef} className={`rounded-2xl p-3.5 ${date === getToday() ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-gray-50 dark:bg-gray-800/60'}`}>
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{formatFull(date)}</p>
          <span className={`text-[10px] font-semibold ${done ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {done ? '✅ ' : ''}{chars.toLocaleString()}자
          </span>
        </div>
        <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${open ? '' : 'line-clamp-2'}`}>
          {entry.text}
        </p>
      </button>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Stats() {
  const { writings, gameState, getCurrentStreak } = useApp()
  const [openDate, setOpenDate] = useState(null)
  const [showAll,  setShowAll]  = useState(false)
  const cardRefs = useRef({})

  const entries    = Object.entries(writings).sort(([a], [b]) => b.localeCompare(a)) // newest first
  const totalChars = entries.reduce((s, [, e]) => s + countChars(e.text), 0)
  const doneDays   = entries.filter(([, e]) => countChars(e.text) >= e.goal).length
  const streak     = getCurrentStreak()
  const visible    = showAll ? entries : entries.slice(0, 10)

  // 히트맵에서 날짜를 누르면 해당 글을 펼치고 스크롤
  const handleSelect = (date) => {
    const idx = entries.findIndex(([d]) => d === date)
    if (idx >= 10) setShowAll(true)
    setOpenDate(date)
  }
  useEffect(() => {
    if (openDate) cardRefs.current[openDate]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [openDate, showAll])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 pt-6 pb-28">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">기록</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="현재 연속" value={`🔥 ${streak}일`} sub={`최장 ${gameState.maxStreak}일`} color="orange" />
        <StatCard label="목표 달성한 날" value={`✅ ${doneDays}일`} sub={`글 쓴 날 ${entries.length}일`} color="emerald" />
        <StatCard label="총 글자 수" value={`✍️ ${totalChars.toLocaleString()}`} sub="공백 제외" color="pink" />
        <StatCard label="누적 EXP" value={`⚡ ${gameState.totalExp.toLocaleString()}`} color="violet" />
      </div>

      {/* Heatmap */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 mb-4 shadow-sm border border-white/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">최근 90일</p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">칸을 누르면 그날 글</span>
        </div>
        <HeatMap onSelect={handleSelect} />
      </div>

      {/* Archive */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">📚 지난 글</p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{entries.length}편</span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">아직 쓴 글이 없어요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(([date, entry]) => (
              <WritingCard key={date} date={date} entry={entry}
                open={openDate === date}
                onToggle={() => setOpenDate(openDate === date ? null : date)}
                cardRef={el => { cardRefs.current[date] = el }} />
            ))}
            {entries.length > 10 && (
              <button onClick={() => setShowAll(v => !v)}
                className="w-full py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-violet-500 dark:hover:text-violet-400 transition-colors">
                {showAll ? '▲ 접기' : `▼ 전체 보기 (${entries.length - 10}편 더)`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
