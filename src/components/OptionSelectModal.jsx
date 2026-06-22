import { useState, useEffect } from 'react'

export default function OptionSelectModal({ habit, onConfirm, onClose }) {
  const [selected, setSelected] = useState([])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const toggle = (opt) => {
    setSelected(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    )
  }

  const handleConfirm = () => onConfirm(selected)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl px-5 pt-4 pb-10 animate-slide-up shadow-2xl">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />

        {/* Habit header */}
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{habit.icon}</span>
          <div>
            <p className="font-bold text-base text-gray-900 dark:text-white">{habit.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">오늘 어떤 걸 했나요?</p>
          </div>
        </div>

        {/* Sub-label */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 mb-3">
          복수 선택 가능 · 선택 없이 완료해도 돼요
        </p>

        {/* Options */}
        <div className="flex flex-wrap gap-2 mb-6">
          {habit.options.map(opt => {
            const active = selected.includes(opt)
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95
                  ${active
                    ? 'bg-violet-500 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-700'
                  }`}
              >
                {active && <span className="mr-1">✓</span>}
                {opt}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={() => onConfirm([])}
            className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            그냥 완료
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="flex-[2] py-3.5 rounded-2xl bg-violet-500 text-white text-sm font-bold transition-all active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-600"
          >
            {selected.length === 0
              ? '항목을 선택하세요'
              : `${selected.join(', ')} 완료!`
            }
          </button>
        </div>
      </div>
    </div>
  )
}
