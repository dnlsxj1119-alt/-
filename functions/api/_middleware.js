// 모든 /api 요청은 WRITE_KEY(비밀번호)가 맞아야 통과
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

async function sameSecret(a, b) {
  const enc = new TextEncoder()
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ])
  return crypto.subtle.timingSafeEqual(ha, hb)
}

export async function onRequest({ request, env, next }) {
  if (!env.WRITE_KEY) return json({ error: '서버 비밀번호(WRITE_KEY)가 설정되지 않았어요' }, 503)
  const auth = request.headers.get('authorization') || ''
  const key  = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!key || !(await sameSecret(key, env.WRITE_KEY))) return json({ error: '비밀번호가 틀렸어요' }, 401)
  return next()
}
