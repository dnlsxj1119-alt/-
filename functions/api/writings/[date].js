// PUT /api/writings/:date — 글 저장. 서버 쪽이 더 최신이면 덮어쓰지 않음 (last-write-wins)
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function onRequestPut({ params, request, env }) {
  const date = params.date
  if (!DATE_RE.test(date)) return Response.json({ error: 'bad date' }, { status: 400 })

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'bad json' }, { status: 400 }) }
  const { text = '', goal, updatedAt, deleted = false } = body
  if (typeof text !== 'string' || !Number.isInteger(goal) || goal <= 0 || typeof updatedAt !== 'string') {
    return Response.json({ error: 'bad body' }, { status: 400 })
  }

  await env.DB.prepare(`
    INSERT INTO writings (date, text, goal, updated_at, deleted) VALUES (?1, ?2, ?3, ?4, ?5)
    ON CONFLICT(date) DO UPDATE SET text = ?2, goal = ?3, updated_at = ?4, deleted = ?5
    WHERE excluded.updated_at > writings.updated_at
  `).bind(date, deleted ? '' : text, goal, updatedAt, deleted ? 1 : 0).run()

  const row = await env.DB.prepare('SELECT text, goal, updated_at, deleted FROM writings WHERE date = ?1').bind(date).first()
  return Response.json({ date, text: row.text, goal: row.goal, updatedAt: row.updated_at, deleted: !!row.deleted })
}
