// PUT /api/settings — { goal } 등 설정 저장
const ALLOWED = ['goal']

export async function onRequestPut({ request, env, data }) {
  let body
  try { body = await request.json() } catch { return Response.json({ error: 'bad json' }, { status: 400 }) }

  const stmts = ALLOWED.filter(k => k in body).map(k =>
    env.DB.prepare('INSERT INTO settings (user_id, key, value) VALUES (?1, ?2, ?3) ON CONFLICT(user_id, key) DO UPDATE SET value = ?3')
      .bind(data.user.id, k, JSON.stringify(body[k])))
  if (stmts.length) await env.DB.batch(stmts)
  return Response.json({ ok: true })
}
