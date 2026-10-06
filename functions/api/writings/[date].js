// PUT /api/writings/:date — 글 저장. 서버 쪽이 더 최신이면 덮어쓰지 않음 (last-write-wins)
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function onRequestPut({ params, request, env }) {
  const date = params.date
  if (!DATE_RE.test(date)) return Response.json({ error: 'bad date' }, { status: 400 })

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'bad json' }, { status: 400 }) }
  const { text = '', goal, updatedAt, deleted = false, scoredChars = null } = body
  if (typeof text !== 'string' || !Number.isInteger(goal) || goal <= 0 || typeof updatedAt !== 'string'
      || (scoredChars !== null && !(Number.isInteger(scoredChars) && scoredChars >= 0))) {
    return Response.json({ error: 'bad body' }, { status: 400 })
  }

  await env.DB.prepare(`
    INSERT INTO writings (date, text, goal, updated_at, deleted, scored_chars) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    ON CONFLICT(date) DO UPDATE SET text = ?2, goal = ?3, updated_at = ?4, deleted = ?5, scored_chars = ?6
    WHERE excluded.updated_at > writings.updated_at
  `).bind(date, deleted ? '' : text, goal, updatedAt, deleted ? 1 : 0, scoredChars).run()

  const row = await env.DB.prepare('SELECT text, goal, updated_at, deleted, scored_chars FROM writings WHERE date = ?1').bind(date).first()
  const res = { date, text: row.text, goal: row.goal, updatedAt: row.updated_at, deleted: !!row.deleted }
  if (row.scored_chars !== null) res.scoredChars = row.scored_chars
  return Response.json(res)
}
