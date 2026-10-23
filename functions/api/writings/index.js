// GET /api/writings — 전체 글 + 설정 (삭제 표시된 글 포함, 기기 간 삭제 동기화용)
export async function onRequestGet({ env, data }) {
  const uid = data.user.id
  const [{ results: rows }, { results: settingRows }] = await Promise.all([
    env.DB.prepare('SELECT date, text, rebuttal, topic, goal, updated_at, deleted, scored_chars FROM writings WHERE user_id = ?1').bind(uid).all(),
    env.DB.prepare('SELECT key, value FROM settings WHERE user_id = ?1').bind(uid).all(),
  ])

  const writings = {}
  for (const r of rows) {
    writings[r.date] = { text: r.text, rebuttal: r.rebuttal, topic: r.topic ? JSON.parse(r.topic) : null, goal: r.goal, updatedAt: r.updated_at, deleted: !!r.deleted }
    if (r.scored_chars !== null) writings[r.date].scoredChars = r.scored_chars
  }
  const settings = {}
  for (const s of settingRows) settings[s.key] = JSON.parse(s.value)

  return Response.json({ writings, settings })
}
