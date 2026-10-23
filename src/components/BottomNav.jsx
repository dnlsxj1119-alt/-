const TABS = [
  { id: 'home',     icon: '✍️', label: '글쓰기' },
  { id: 'creature', icon: '🐾', label: '크리처' },
  { id: 'stats',    icon: '📊', label: '기록'   },
  { id: 'settings', icon: '⚙️', label: '설정'  },
]

export default function BottomNav({ current, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
      {/* 배경은 화면 전체 폭, 버튼은 가운데 좁은 폭 그대로 */}
      <div className="max-w-md mx-auto px-2 pb-safe">
        <div className="flex">
          {TABS.map(tab => {
            const active = current === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all
                  ${active
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                  }`}
              >
                <span className={`text-xl leading-none transition-transform ${active ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
                {active && (
                  <span className="absolute top-1 w-1 h-1 rounded-full bg-violet-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
