// /api 요청은 로그인 세션이 있어야 통과 (가입·로그인만 예외)
import { json, sha256hex, bearerToken } from '../../server/auth.js'

const PUBLIC_PATHS = ['/api/auth/signup', '/api/auth/login']

export async function onRequest({ request, env, data, next }) {
  if (PUBLIC_PATHS.includes(new URL(request.url).pathname)) return next()

  const token = bearerToken(request)
  if (!token) return json({ error: '로그인이 필요해요' }, 401)

  const row = await env.DB.prepare(`
    SELECT s.user_id, u.username FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?1 AND s.expires_at > ?2
  `).bind(await sha256hex(token), new Date().toISOString()).first()
  if (!row) return json({ error: '다시 로그인해주세요' }, 401)

  data.user = { id: row.user_id, username: row.username }
  return next()
}
