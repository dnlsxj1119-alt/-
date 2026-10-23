// Cloudflare Pages Functions(/api) + D1 와 통신

export class AuthError extends Error {}

async function request(key, path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}`, ...options.headers },
  })
  const body = await res.json().catch(() => ({}))
  if (res.status === 401) throw new AuthError(body.error || '로그인이 필요해요')
  if (!res.ok) throw new Error(body.error || `서버 오류 (${res.status})`)
  return body
}

export const signup = (username, password) =>
  request('', '/auth/signup', { method: 'POST', body: JSON.stringify({ username, password }) })

export const login = (username, password) =>
  request('', '/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })

export const logout = (token) => request(token, '/auth/logout', { method: 'POST' })

export const fetchAll = (key) => request(key, '/writings')

export const putWriting = (key, date, entry) =>
  request(key, `/writings/${date}`, { method: 'PUT', body: JSON.stringify(entry) })

export const putSettings = (key, settings) =>
  request(key, '/settings', { method: 'PUT', body: JSON.stringify(settings) })
