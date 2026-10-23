import { json, verifyPassword, createSession, readCredentials } from '../../../server/auth.js'

export async function onRequestPost({ request, env }) {
  const cred = await readCredentials(request)
  if (!cred) return json({ error: 'bad json' }, 400)

  const user = await env.DB.prepare('SELECT id, username, pw_hash, pw_salt FROM users WHERE username = ?1').bind(cred.username).first()
  const ok = user && await verifyPassword(cred.password, user.pw_hash, user.pw_salt)
  if (!ok) return json({ error: '아이디 또는 비밀번호가 틀렸어요' }, 401)

  const token = await createSession(env.DB, user.id)
  return json({ token, username: user.username })
}
