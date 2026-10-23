// 서버(Pages Functions) 공용 인증 유틸 — functions/ 밖에 둬서 라우트로 잡히지 않게 함
const enc = new TextEncoder()
const ITERATIONS = 100000 // Workers의 PBKDF2 최대치
const SESSION_DAYS = 365

const toHex   = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map(h => parseInt(h, 16)))

export const json = (body, status = 200) => Response.json(body, { status })

export const USERNAME_RE = /^[a-zA-Z0-9_가-힣]{2,20}$/
export const MIN_PASSWORD = 6

export const sha256hex = async (s) => toHex(await crypto.subtle.digest('SHA-256', enc.encode(s)))

export async function hashPassword(password, saltHex) {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16))
  const key  = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256)
  return { hash: toHex(bits), salt: toHex(salt) }
}

export async function verifyPassword(password, hashHex, saltHex) {
  const { hash } = await hashPassword(password, saltHex)
  return crypto.subtle.timingSafeEqual(fromHex(hash), fromHex(hashHex))
}

/** 새 세션 토큰 발급. DB에는 토큰의 해시만 저장 */
export async function createSession(db, userId) {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)))
  const now = new Date()
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400000)
  await db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)')
    .bind(await sha256hex(token), userId, now.toISOString(), expires.toISOString()).run()
  return token
}

export const bearerToken = (request) => {
  const auth = request.headers.get('authorization') || ''
  return auth.startsWith('Bearer ') ? auth.slice(7) : ''
}

export async function readCredentials(request) {
  let body
  try { body = await request.json() } catch { return null }
  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  return { username, password }
}
