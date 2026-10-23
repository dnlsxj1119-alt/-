import { useState } from 'react'
import { useApp } from '../context/AppContext'

const inputClass = 'w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm'

export default function Login() {
  const { login } = useApp()
  const [mode,     setMode]     = useState('login') // login | signup
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const isSignup = mode === 'signup'
  const canSubmit = username.trim() && password && (!isSignup || confirm)

  const switchMode = (m) => { setMode(m); setError(''); setConfirm('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    if (isSignup && password !== confirm) { setError('비밀번호가 서로 달라요'); return }
    setLoading(true); setError('')
    try { await login(mode, username.trim(), password) }
    catch (err) { setError(err.message || '연결할 수 없어요') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-6 flex flex-col items-center justify-center">
      <div className="text-7xl mb-4 animate-float select-none">🥚</div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">글쓰기 크리처</h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 text-center">로그인하면 어느 기기에서든<br />내 글을 이어 쓸 수 있어요</p>

      {/* Tabs */}
      <div className="flex w-full max-w-xs bg-white/60 dark:bg-gray-800/60 rounded-2xl p-1 mb-4">
        {[['login', '로그인'], ['signup', '회원가입']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => switchMode(key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all
              ${mode === key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <input
          type="text" autoComplete="username" autoCapitalize="none" spellCheck={false}
          value={username} onChange={e => setUsername(e.target.value)}
          placeholder="아이디" className={inputClass}
        />
        <input
          type="password" autoComplete={isSignup ? 'new-password' : 'current-password'}
          value={password} onChange={e => setPassword(e.target.value)}
          placeholder={isSignup ? '비밀번호 (6자 이상)' : '비밀번호'} className={inputClass}
        />
        {isSignup && (
          <input
            type="password" autoComplete="new-password"
            value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="비밀번호 확인" className={inputClass}
          />
        )}
        {isSignup && <p className="text-[11px] text-gray-400 dark:text-gray-500 px-1">아이디는 2~20자 한글·영문·숫자·_ 만 쓸 수 있어요</p>}
        {error && <p className="text-xs text-red-500 px-1">{error}</p>}
        <button type="submit" disabled={loading || !canSubmit}
          className="w-full py-3 rounded-2xl bg-violet-500 hover:bg-violet-600 active:scale-95 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/30">
          {loading ? '확인 중…' : isSignup ? '가입하고 시작하기' : '로그인'}
        </button>
      </form>
    </div>
  )
}
