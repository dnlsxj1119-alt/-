import { useState } from 'react'
import { DIFFICULTIES } from '../utils/constants'

const DIFF_BADGE = {
  easy:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  normal: 'bg-amber-100  text-amber-700   dark:bg-amber-900/40   dark:text-amber-400',
  hard:   'bg-rose-100   text-rose-700    dark:bg-rose-900/40    dark:text-rose-400',
}

export default function HabitItem({ habit, isChecked, selectedOptions = [], onToggle }) {
  const [popping, setPopping] = useState(false)
  const hasOptions = habit.options?.length > 0
  const isLifeType = habit.type === 'life'

  const handleClick = () => {
    if (!isChecked) { setPopping(true); setTimeout(() => setPopping(false), 400) }
    onToggle()
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 select-none
        ${isChecked
          ? 'bg-gray-100 dark:bg-gray-800/60 opacity-70'
          : isLifeType
            ? 'bg-emerald-50/80 dark:bg-emerald-900/10 shadow-sm active:scale-[0.98]'
            : 'bg-white dark:bg-gray-800 shadow-sm active:scale-[0.98]'
        }`}
    >
      {/* Emoji */}
      <span className={`text-2xl leading-none flex-shrink-0 transition-transform duration-200 ${popping ? 'animate-check-pop' : ''}`}>
        {habit.icon}
      </span>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${isChecked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}>
          {habit.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {/* Type badge */}
          {isLifeType ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              🌿 라이프
            </span>
          ) : (
            <>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${DIFF_BADGE[habit.difficulty]}`}>
                {DIFFICULTIES[habit.difficulty]?.label}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">+{DIFFICULTIES[habit.difficulty]?.exp} EXP</span>
            </>
          )}

          {/* Options hint */}
          {hasOptions && !isChecked && (
            <span className="text-[10px] text-violet-400 dark:text-violet-500 font-medium">
              · {habit.options.slice(0, 3).join(' / ')}{habit.options.length > 3 ? ' …' : ''}
            </span>
          )}

          {/* Selected options when checked */}
          {isChecked && selectedOptions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {selectedOptions.map(opt => (
                <span key={opt} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">{opt}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-200
        ${isChecked
          ? isLifeType ? 'bg-emerald-500 border-emerald-500' : 'bg-violet-500 border-violet-500'
          : isLifeType
            ? 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-500'
            : hasOptions
              ? 'border-violet-300 dark:border-violet-700 hover:border-violet-500'
              : 'border-gray-200 dark:border-gray-600 hover:border-violet-400'
        }`}
      >
        {isChecked ? (
          <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : isLifeType ? (
          <span className="text-xs text-emerald-400">🌿</span>
        ) : hasOptions ? (
          <svg className="w-3.5 h-3.5 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        ) : null}
      </div>
    </div>
  )
}
