import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import HabitForm from '../components/HabitForm'
import { DIFFICULTIES } from '../utils/constants'
import { useNotification } from '../hooks/useNotification'

const DIFF_COLOR = {
  easy:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  normal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  hard:   'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

function Section({ title, children }) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/50 dark:border-gray-700/50 mb-4 overflow-hidden">
      {title && (
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 pt-4 pb-2">{title}</p>
      )}
      {children}
    </div>
  )
}

function ConfirmModal({ title, desc, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-fade-in">
        <p className="font-bold text-gray-900 dark:text-white text-center mb-2">{title}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center mb-5">{desc}</p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm">
            취소
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-violet-500 text-white font-bold text-sm">
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const {
    habits, addHabit, updateHabit, deleteHabit,
    darkMode, toggleDarkMode,
    notifSettings, updateNotifSettings,
    showToast, resetAllData,
    exportData, importData,
  } = useApp()

  const { getPermission } = useNotification(notifSettings)

  const [formOpen, setFormOpen]       = useState(false)
  const [editHabit, setEditHabit]     = useState(null)
  const [confirmReset, setConfirmReset]   = useState(false)
  const [importConfirm, setImportConfirm] = useState(null) // pending File
  const importRef = useRef(null)

  const handleSave = (data) => {
    if (editHabit) { updateHabit(editHabit.id, data); showToast('✅ 습관이 수정되었어요', 'success') }
    else           { addHabit(data);                  showToast('✅ 습관이 추가되었어요', 'success') }
    setFormOpen(false); setEditHabit(null)
  }

  const handleDelete = (h) => { deleteHabit(h.id); showToast('🗑️ 습관이 삭제되었어요', 'info') }
  const handleEdit   = (h) => { setEditHabit(h); setFormOpen(true) }

  // ── Notification ──────────────────────────────────────────────────────────
  const handleNotifToggle = async () => {
    if (!notifSettings.enabled) {
      const perm = await getPermission()
      if (perm !== 'granted') {
        showToast('알림 권한이 필요해요 🔔', 'error'); return
      }
    }
    updateNotifSettings({ ...notifSettings, enabled: !notifSettings.enabled })
  }

  const handleTimeChange = (e) => {
    updateNotifSettings({ ...notifSettings, time: e.target.value })
  }

  // ── Export / Import ───────────────────────────────────────────────────────
  const handleExport = () => {
    exportData()
    showToast('📦 데이터를 내보냈어요', 'success')
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportConfirm(file)
    e.target.value = ''
  }

  const handleImportConfirm = async () => {
    const file = importConfirm
    setImportConfirm(null)
    try {
      await importData(file)
      showToast('✅ 데이터를 복원했어요', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 pt-6 pb-28">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-5">설정</h1>

      {/* Appearance */}
      <Section>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">다크모드</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{darkMode ? '켜짐' : '꺼짐'}</p>
            </div>
          </div>
          <button onClick={toggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${darkMode ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="알림">
        <div className="px-5 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">매일 알림</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">앱이 열려 있을 때 작동해요</p>
            </div>
            <button onClick={handleNotifToggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${notifSettings.enabled ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifSettings.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {notifSettings.enabled && (
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">알림 시각</span>
              <input
                type="time"
                value={notifSettings.time}
                onChange={handleTimeChange}
                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}
        </div>
      </Section>

      {/* Habits */}
      <Section>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white">나의 습관</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{habits.length}개 등록됨</p>
          </div>
          <button onClick={() => { setEditHabit(null); setFormOpen(true) }}
            className="flex items-center gap-1.5 bg-violet-500 hover:bg-violet-600 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
          >
            <span className="text-base leading-none">+</span>습관 추가
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="text-4xl mb-2">🌱</span>
            <p className="text-sm text-gray-400 dark:text-gray-500">아직 습관이 없어요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {habits.map(h => (
              <div key={h.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-xl flex-shrink-0">{h.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{h.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{h.category}</span>
                    <span className="text-gray-200 dark:text-gray-700">·</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${DIFF_COLOR[h.difficulty]}`}>
                      {DIFFICULTIES[h.difficulty]?.label}
                    </span>
                    {h.options?.length > 0 && (
                      <span className="text-[10px] text-violet-400 font-medium">· {h.options.length}개 옵션</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleEdit(h)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-sm">✏️</button>
                  <button onClick={() => handleDelete(h)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Data */}
      <Section title="데이터">
        <div className="px-5 pb-4 space-y-2">
          <button onClick={handleExport}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
          >
            <span className="text-xl">📤</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-400">데이터 내보내기</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">JSON 파일로 백업</p>
            </div>
          </button>

          <button onClick={() => importRef.current?.click()}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            <span className="text-xl">📥</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">데이터 가져오기</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">JSON 백업 파일로 복원</p>
            </div>
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
        </div>
      </Section>

      {/* Danger */}
      <Section title="위험 구역">
        <div className="px-5 pb-4">
          <button onClick={() => setConfirmReset(true)}
            className="w-full py-3 rounded-2xl border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            모든 데이터 초기화
          </button>
        </div>
      </Section>

      {/* Modals */}
      {formOpen && (
        <HabitForm habit={editHabit} onSave={handleSave} onClose={() => { setFormOpen(false); setEditHabit(null) }} />
      )}

      {confirmReset && (
        <ConfirmModal
          title="정말 초기화할까요?"
          desc="모든 습관, 기록, EXP가 삭제돼요. 되돌릴 수 없어요!"
          onConfirm={() => { resetAllData(); setConfirmReset(false); showToast('🔄 초기화 완료', 'info') }}
          onClose={() => setConfirmReset(false)}
        />
      )}

      {importConfirm && (
        <ConfirmModal
          title="데이터를 가져올까요?"
          desc="현재 데이터가 백업 파일로 덮어쓰여요. 기존 데이터는 사라져요!"
          onConfirm={handleImportConfirm}
          onClose={() => setImportConfirm(null)}
        />
      )}
    </div>
  )
}
