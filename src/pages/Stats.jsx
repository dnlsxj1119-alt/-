import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import HeatMap from '../components/HeatMap'
import HabitCalendarModal from '../components/HabitCalendarModal'
import { getToday, formatFull } from '../utils/dateUtils'

// ── Gratitude helpers ─────────────────────────────────────────────────────────
const GRATITUDE_KEY = 'hg_gratitude'
const loadGratitude = () => { try { return JSON.parse(localStorage.getItem(GRATITUDE_KEY) || '{}') } catch { return {} } }
const saveGratitude = (data) => localStorage.setItem(GRATITUDE_KEY, JSON.stringify(data))

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

function HabitBar({ habit, rate, onClick }) {
  const pct = Math.round(rate * 100)
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 text-left hover:bg-violet-50 dark:hover:bg-violet-900/10 rounded-2xl p-1.5 -mx-1.5 transition-colors group">
      <span className="text-lg w-7 text-center flex-shrink-0">{habit.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{habit.name}</p>
          <span className="text-xs font-bold text-violet-600 dark:text-violet-400 ml-2 flex-shrink-0">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-[10px] text-gray-300 dark:text-gray-600 group-hover:text-violet-400 dark:group-hover:text-violet-500 transition-colors flex-shrink-0">📅</span>
    </button>
  )
}

function GratitudeLog() {
  const today = getToday()
  const [all,      setAll]      = useState(() => loadGratitude())
  const [editDate, setEditDate] = useState(null)
  const [draft,    setDraft]    = useState('')
  const [showAll,  setShowAll]  = useState(false)
  const textRef = useRef(null)

  const entries = Object.entries(all).sort(([a], [b]) => b.localeCompare(a)) // newest first
  const visible = showAll ? entries : entries.slice(0, 5)

  const startEdit = (date, content) => {
    setEditDate(date)
    setDraft(content)
    setTimeout(() => textRef.current?.focus(), 50)
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    const next = { ...all }
    if (trimmed) next[editDate] = trimmed
    else delete next[editDate]
    saveGratitude(next)
    setAll(next)
    setEditDate(null)
    setDraft('')
  }

  const handleCancel = () => { setEditDate(null); setDraft('') }

  // New entry for today if not yet written
  const handleAddToday = () => startEdit(today, all[today] || '')

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">🙏 감사 일기</p>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{entries.length}개 기록</span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">아직 감사 일기가 없어요</p>
          <button onClick={handleAddToday}
            className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
            오늘 첫 감사 일기 쓰기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Add today button if today not yet written */}
          {!all[today] && (
            <button onClick={handleAddToday}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-900/40 text-amber-500 dark:text-amber-400 text-xs font-medium hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all">
              + 오늘의 감사 한 줄 추가
            </button>
          )}

          {visible.map(([date, content]) => (
            <div key={date} className={`rounded-2xl p-3.5 ${date === today ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-800/60'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {date === today && <span className="text-[9px] font-bold bg-amber-400 text-white px-1.5 py-0.5 rounded-full">오늘</span>}
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{formatFull(date)}</p>
                </div>
                <button onClick={() => editDate === date ? handleCancel() : startEdit(date, content)}
                  className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-violet-500 dark:hover:text-violet-400 transition-colors font-medium px-1.5">
                  {editDate === date ? '취소' : '수정'}
                </button>
              </div>

              {editDate === date ? (
                <div>
                  <textarea
                    ref={textRef}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    maxLength={100}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleSave}
                      className="flex-1 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-xs font-bold active:scale-95 transition-all">저장</button>
                    {draft.trim() === '' && content && (
                      <button onClick={handleSave}
                        className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">삭제</button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
              )}
            </div>
          ))}

          {entries.length > 5 && (
            <button onClick={() => setShowAll(v => !v)}
              className="w-full py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-violet-500 dark:hover:text-violet-400 transition-colors">
              {showAll ? '▲ 접기' : `▼ 전체 보기 (${entries.length - 5}개 더)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Stats() {
  const { gameState, logs, getHabitStats, getTotalCompletions, getCurrentStreak } = useApp()
  const [calendarHabit, setCalendarHabit] = useState(null)

  const habitStats = getHabitStats()
  const totalDone  = getTotalCompletions()
  const streak     = getCurrentStreak()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 pt-6 pb-28">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">기록</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="누적 EXP" value={`⚡ ${gameState.totalExp.toLocaleString()}`} color="violet" />
        <StatCard label="현재 스트릭" value={`🔥 ${streak}일`} sub={`최장 ${gameState.maxStreak}일`} color="orange" />
        <StatCard label="총 달성 횟수" value={`✅ ${totalDone}`} color="emerald" />
        <StatCard label="등록 습관" value={`📋 ${gameState.badges.length} 배지`} sub="마일스톤 달성" color="pink" />
      </div>

      {/* Heatmap */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 mb-4 shadow-sm border border-white/50 dark:border-gray-700/50">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">최근 90일 활동</p>
        <HeatMap />
      </div>

      {/* Habit completion chart */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-5 mb-4 shadow-sm border border-white/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">습관별 달성률</p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">최근 30일 · 탭하면 달력</span>
        </div>
        {habitStats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">아직 데이터가 없어요</p>
          </div>
        ) : (
          <div className="space-y-1">
            {habitStats.map((h, i) => (
              <HabitBar key={h.id} habit={h} rate={h.rate} rank={i + 1} onClick={() => setCalendarHabit(h)} />
            ))}
          </div>
        )}
      </div>

      {/* Gratitude journal log */}
      <GratitudeLog />

      {/* Calendar modal */}
      {calendarHabit && (
        <HabitCalendarModal habit={calendarHabit} logs={logs} onClose={() => setCalendarHabit(null)} />
      )}
    </div>
  )
}
