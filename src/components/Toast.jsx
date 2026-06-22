import { useApp } from '../context/AppContext'

const TYPE_STYLES = {
  exp:     'bg-violet-500 text-white',
  badge:   'bg-yellow-400 text-gray-900',
  streak:  'bg-orange-500 text-white',
  success: 'bg-emerald-500 text-white',
  error:   'bg-red-500 text-white',
  info:    'bg-gray-800 text-white dark:bg-gray-700',
}

export default function Toast() {
  const { toasts } = useApp()
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full max-w-[320px] px-4 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`animate-slide-up rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg text-center min-w-[140px] ${TYPE_STYLES[t.type] || TYPE_STYLES.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
