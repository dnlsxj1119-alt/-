import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login } = useApp()
  const [key,     setKey]     = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!key.trim()) return
    setLoading(true); setError('')
    try { await login(key.trim()) }
    catch (err) { setError(err.message || '연결할 수 없어요') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-6 flex flex-col items-center justify-center">
      <div className="text-7xl mb-4 animate-float select-none">🥚</div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">글쓰기 크리처</h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 text-center">비밀번호를 입력하면 어느 기기에서든<br />같은 글을 이어 쓸 수 있어요</p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <input
          type="password"
          autoComplete="current-password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="비밀번호"
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
        />
        {error && <p className="text-xs text-red-500 px-1">{error}</p>}
        <button type="submit" disabled={loading || !key.trim()}
          className="w-full py-3 rounded-2xl bg-violet-500 hover:bg-violet-600 active:scale-95 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/30">
          {loading ? '확인 중…' : '시작하기'}
        </button>
      </form>
    </div>
  )
}
