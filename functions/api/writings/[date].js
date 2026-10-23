// PUT /api/writings/:date — 글 저장. 서버 쪽이 더 최신이면 덮어쓰지 않음 (last-write-wins)
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function onRequestPut({ params, request, env, data }) {
  const uid = data.user.id
  const date = params.date
  if (!DATE_RE.test(date)) return Response.json({ error: 'bad date' }, { status: 400 })

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'bad json' }, { status: 400 }) }
  const { text = '', rebuttal = '', topic = null, goal, updatedAt, deleted = false, scoredChars = null } = body
  const topicJson = topic && typeof topic === 'object' ? JSON.stringify(topic).slice(0, 2000) : null
  if (typeof text !== 'string' || typeof rebuttal !== 'string' || !Number.isInteger(goal) || goal <= 0 || typeof updatedAt !== 'string'
      || (scoredChars !== null && !(Number.isInteger(scoredChars) && scoredChars >= 0))) {
    return Response.json({ error: 'bad body' }, { status: 400 })
  }

  await env.DB.prepare(`
    INSERT INTO writings (date, text, goal, updated_at, deleted, scored_chars, rebuttal, user_id, topic) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
    ON CONFLICT(user_id, date) DO UPDATE SET text = ?2, goal = ?3, updated_at = ?4, deleted = ?5, scored_chars = ?6, rebuttal = ?7, topic = ?9
    WHERE excluded.updated_at > writings.updated_at
  `).bind(date, deleted ? '' : text, goal, updatedAt, deleted ? 1 : 0, scoredChars, deleted ? '' : rebuttal, uid, topicJson).run()

  const row = await env.DB.prepare('SELECT text, rebuttal, topic, goal, updated_at, deleted, scored_chars FROM writings WHERE user_id = ?1 AND date = ?2').bind(uid, date).first()
  const res = { date, text: row.text, rebuttal: row.rebuttal, topic: row.topic ? JSON.parse(row.topic) : null, goal: row.goal, updatedAt: row.updated_at, deleted: !!row.deleted }
  if (row.scored_chars !== null) res.scoredChars = row.scored_chars
  return Response.json(res)
}
