// Cloudflare Pages Functions(/api) + D1 와 통신

export class AuthError extends Error {}

async function request(key, path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}`, ...options.headers },
  })
  if (res.status === 401) throw new AuthError('비밀번호가 틀렸어요')
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `서버 오류 (${res.status})`)
  return body
}

export const fetchAll = (key) => request(key, '/writings')

export const putWriting = (key, date, entry) =>
  request(key, `/writings/${date}`, { method: 'PUT', body: JSON.stringify(entry) })

export const putSettings = (key, settings) =>
  request(key, '/settings', { method: 'PUT', body: JSON.stringify(settings) })
