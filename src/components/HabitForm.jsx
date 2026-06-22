import { useState, useEffect } from 'react'
import { EMOJI_CATEGORIES, CATEGORIES, DIFFICULTIES, HABIT_TYPES } from '../utils/constants'

const DEFAULTS = { name: '', icon: '⭐', category: '건강', difficulty: 'easy', type: 'core', options: [] }

export default function HabitForm({ habit, onSave, onClose }) {
  const [form, setForm] = useState(
    habit
      ? { name: habit.name, icon: habit.icon, category: habit.category, difficulty: habit.difficulty, type: habit.type || 'core', options: habit.options || [] }
      : DEFAULTS
  )
  const [showEmoji,   setShowEmoji]   = useState(false)
  const [emojiTab,    setEmojiTab]    = useState(0)
  const [optionInput, setOptionInput] = useState('')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, name: form.name.trim() })
  }

  const addOption = () => {
    const val = optionInput.trim()
    if (!val || form.options.includes(val) || form.options.length >= 10) return
    setForm(f => ({ ...f, options: [...f.options, val] }))
    setOptionInput('')
  }

  const removeOption = (opt) => setForm(f => ({ ...f, options: f.options.filter(o => o !== opt) }))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl px-5 pt-4 pb-8 animate-slide-up shadow-2xl max-h-[90svh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
          {habit ? '습관 수정' : '습관 추가'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Habit Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">습관 타입</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(HABIT_TYPES).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: key }))}
                  className={`p-3 rounded-2xl text-left transition-all border-2
                    ${form.type === key
                      ? key === 'core'
                        ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-transparent bg-gray-100 dark:bg-gray-800'
                    }`}
                >
                  <p className="text-base font-bold mb-0.5">{t.icon} {t.label}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">아이콘</label>
            <button
              type="button"
              onClick={() => setShowEmoji(v => !v)}
              className="w-14 h-14 text-3xl bg-violet-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-violet-100 dark:hover:bg-gray-700 transition-colors"
            >
              {form.icon}
            </button>
            {showEmoji && (
              <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
                {/* Category tabs */}
                <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 dark:border-gray-700 px-2 pt-2 gap-1">
                  {EMOJI_CATEGORIES.map((cat, i) => (
                    <button key={i} type="button"
                      onClick={() => setEmojiTab(i)}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-t-lg text-[10px] font-semibold transition-colors whitespace-nowrap
                        ${emojiTab === i
                          ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400'
                          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'}`}
                    >{cat.label}</button>
                  ))}
                </div>
                {/* Emoji grid */}
                <div className="p-2.5 grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                  {EMOJI_CATEGORIES[emojiTab].emojis.map(emoji => (
                    <button key={emoji} type="button"
                      onClick={() => { setForm(f => ({ ...f, icon: emoji })); setShowEmoji(false) }}
                      className={`text-xl p-1.5 rounded-xl hover:bg-violet-100 dark:hover:bg-gray-700 transition-colors ${form.icon === emoji ? 'bg-violet-200 dark:bg-violet-900' : ''}`}
                    >{emoji}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">이름</label>
            <input
              type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="습관 이름을 입력하세요" maxLength={30}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-medium"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                    ${form.category === cat ? 'bg-violet-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-gray-700'}`}
                >{cat}</button>
              ))}
            </div>
          </div>

          {/* Difficulty (core only) */}
          {form.type === 'core' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">난이도</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(DIFFICULTIES).map(([key, d]) => (
                  <button key={key} type="button" onClick={() => setForm(f => ({ ...f, difficulty: key }))}
                    className={`py-2.5 rounded-2xl text-sm font-semibold transition-all
                      ${form.difficulty === key
                        ? key === 'easy' ? 'bg-emerald-500 text-white' : key === 'normal' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                  >
                    {d.label}
                    <span className="block text-[10px] font-normal opacity-80">+{d.exp} EXP</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Life type: milestone hint */}
          {form.type === 'life' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">🌿 라이프 습관 아이템 언락</p>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500">7일 · 21일 · 66일 달성 시 서식지 아이템이 자동으로 언락돼요</p>
            </div>
          )}

          {/* Sub-options */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
              선택 옵션 <span className="font-normal text-gray-400">(선택 사항 · 최대 10개)</span>
            </label>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">체크 시 세부 항목 선택 가능. 예: 운동 → 러닝, 헬스, 수영</p>
            {form.options.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.options.map(opt => (
                  <span key={opt} className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full text-xs font-semibold">
                    {opt}
                    <button type="button" onClick={() => removeOption(opt)} className="text-violet-400 hover:text-violet-700 text-sm leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
            {form.options.length < 10 && (
              <div className="flex gap-2">
                <input type="text" value={optionInput} onChange={e => setOptionInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
                  placeholder="옵션 이름 입력 후 추가" maxLength={20}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
                />
                <button type="button" onClick={addOption} disabled={!optionInput.trim()}
                  className="px-4 py-2.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-xl text-sm font-semibold hover:bg-violet-200 disabled:opacity-40 transition-colors">추가</button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">취소</button>
            <button type="submit" disabled={!form.name.trim()}
              className="flex-1 py-3.5 rounded-2xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {habit ? '수정하기' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
