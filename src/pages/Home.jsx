import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { countChars, scoredChars } from '../hooks/useAppStore'
import CreatureDisplay from '../components/CreatureDisplay'
import ProgressBar from '../components/ProgressBar'
import CalendarModal from '../components/CalendarModal'
import { WRITING_PROMPTS } from '../utils/constants'
import { getToday, getYesterday, getActiveDate, subtractDay, addDay, formatFull } from '../utils/dateUtils'

const SYNC_LABEL = {
  idle:    '',
  syncing: '☁️ 동기화 중…',
  pending: '☁️ 저장 중…',
  synced:  '☁️ 저장됨',
  offline: '📴 오프라인 · 기기에 저장됨',
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const getDayLabel = (dateStr) => DAYS[new Date(dateStr + 'T00:00:00').getDay()]

// 날짜마다 고정된 글감 (같은 날엔 같은 글감)
const promptIndexFor = (dateStr) =>
  [...dateStr].reduce((s, c) => s + c.charCodeAt(0), 0) % WRITING_PROMPTS.length

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const today = getToday()
  const yesterday = getYesterday()
  // 낮 12시 전이면 어제 글도 이어 쓸 수 있음
  const isLateNight = getActiveDate() === yesterday

  const [viewDate,     setViewDate]     = useState(today)
  const [promptOffset, setPromptOffset] = useState(0)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const isPast = viewDate !== today
  // 오늘 + (낮 12시 전) 어제 글만 기록·EXP에 반영. 그 이전 글은 내용만 수정
  const editable = !isPast || (isLateNight && viewDate === yesterday)
  const locked   = !editable

  const {
    writings, saveWriting, settings, syncStatus,
    gameState, getCurrentStreak, getStreakMultiplier, getCreatureStage, getTodayRate,
  } = useApp()

  const entry = writings[viewDate]
  const text  = entry?.text || ''
  const textRef = useRef(null)

  // 입력창 높이 자동 조절
  useEffect(() => {
    const el = textRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(240, el.scrollHeight)}px`
  }, [text])

  const handleChange = (e) => saveWriting(viewDate, e.target.value, { locked })
  const changeDate   = (date) => { setViewDate(date); setPromptOffset(0) }

  const goal       = entry?.goal ?? settings.goal
  const chars      = locked ? scoredChars(entry) : countChars(text)
  const rate       = Math.min(1, chars / goal)
  const done       = chars >= goal
  const streak     = getCurrentStreak()
  const multiplier = getStreakMultiplier(streak + (done ? 0 : 1))
  const creature   = getCreatureStage()
  const todayRate  = getTodayRate()
  const dayExp     = gameState.expByDate[viewDate] || 0

  const prompt = WRITING_PROMPTS[(promptIndexFor(viewDate) + promptOffset) % WRITING_PROMPTS.length]

  const goBack    = () => changeDate(subtractDay(viewDate))
  const goForward = () => { if (isPast) changeDate(addDay(viewDate)) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 pt-6 pb-28">

      {/* Date navigation header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={goBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 shadow-sm hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-xl font-light flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed">
          ‹
        </button>
        <button onClick={() => setCalendarOpen(true)} className="flex-1 min-w-0 text-center rounded-2xl py-0.5 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
          <p className={`text-[10px] font-semibold ${isPast ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {!isPast ? '오늘의 글' : viewDate === yesterday ? '어제의 글' : '지난 글'}
          </p>
          <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
            {formatFull(viewDate)} ({getDayLabel(viewDate)}) <span className="text-sm">📅</span>
          </h1>
        </button>
        <button onClick={goForward} disabled={!isPast}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 shadow-sm hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-xl font-light flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed">
          ›
        </button>
        <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1.5 rounded-full flex-shrink-0">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-bold">{streak}일</span>
        </div>
      </div>

      {/* Past mode notice */}
      {isPast && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="text-sm">{editable ? '🌙' : '✏️'}</span>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {editable ? '낮 12시 전까지 어제 글을 이어 쓸 수 있어요' : '지난 글 수정 · 연속 기록과 EXP는 그대로예요'}
          </p>
          <button onClick={() => changeDate(today)}
            className="ml-auto text-[10px] text-blue-500 dark:text-blue-400 font-bold underline">오늘로</button>
        </div>
      )}

      {/* Creature + goal progress */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-4 mb-4 shadow-sm border border-white/50 dark:border-gray-700/50">
        <div className="flex items-center gap-4">
          <CreatureDisplay size="sm" completionRate={todayRate} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">{creature.name}</span>
                <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">Lv.{creature.stage}</span>
              </div>
              {dayExp > 0 && <span className="text-sm font-bold text-violet-600 dark:text-violet-400">+{dayExp} EXP</span>}
            </div>
            <ProgressBar
              value={rate}
              colorClass={done ? 'bg-gradient-to-r from-violet-500 to-pink-500' : 'bg-violet-400'}
              height="h-2"
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              <span>
                <b className="text-gray-700 dark:text-gray-300">{chars.toLocaleString()}</b> / {goal.toLocaleString()}자
              </span>
              <span>
                {done
                  ? '✅ 목표 달성!'
                  : multiplier > 1 ? `달성 시 x${multiplier} 보너스` : `${(goal - chars).toLocaleString()}자 남음`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt */}
      {editable && <div className="flex items-start gap-2 px-1 mb-2">
        <p className="flex-1 text-sm text-gray-600 dark:text-gray-400 leading-snug">
          <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400 mr-1.5">글감</span>{prompt}
        </p>
        <button onClick={() => setPromptOffset(o => o + 1)}
          className="text-[10px] text-gray-400 hover:text-violet-500 transition-colors flex-shrink-0 pt-0.5">
          ↻ 다른 글감
        </button>
      </div>}

      {/* Editor */}
      <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-sm border border-white/50 dark:border-gray-700/50 p-4">
        <textarea
          ref={textRef}
          value={text}
          onChange={handleChange}
          placeholder={editable ? '아무 말이나 괜찮아요. 일단 쓰기 시작해보세요.' : '이 날은 쓴 글이 없어요. 지금 남겨도 기록·EXP에는 반영되지 않아요.'}
          className="w-full bg-transparent text-[15px] leading-7 text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none resize-none"
          style={{ minHeight: 240 }}
        />
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500">
          <span>공백 포함 {text.length.toLocaleString()}자</span>
          <span className={syncStatus === 'offline' ? 'text-amber-500' : ''}>{SYNC_LABEL[syncStatus]}</span>
        </div>
      </div>

      {calendarOpen && (
        <CalendarModal writings={writings} selected={viewDate} onSelect={changeDate} onClose={() => setCalendarOpen(false)} />
      )}
    </div>
  )
}
