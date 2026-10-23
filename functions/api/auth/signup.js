import { json, hashPassword, createSession, readCredentials, USERNAME_RE, MIN_PASSWORD } from '../../../server/auth.js'

export async function onRequestPost({ request, env }) {
  const cred = await readCredentials(request)
  if (!cred) return json({ error: 'bad json' }, 400)
  const { username, password } = cred

  if (!USERNAME_RE.test(username)) return json({ error: '아이디는 2~20자 한글·영문·숫자·_ 만 쓸 수 있어요' }, 400)
  if (password.length < MIN_PASSWORD) return json({ error: `비밀번호는 ${MIN_PASSWORD}자 이상이어야 해요` }, 400)

  const exists = await env.DB.prepare('SELECT 1 FROM users WHERE username = ?1').bind(username).first()
  if (exists) return json({ error: '이미 있는 아이디예요' }, 409)

  const { hash, salt } = await hashPassword(password)
  const user = await env.DB.prepare('INSERT INTO users (username, pw_hash, pw_salt, created_at) VALUES (?1, ?2, ?3, ?4) RETURNING id')
    .bind(username, hash, salt, new Date().toISOString()).first()

  const token = await createSession(env.DB, user.id)
  return json({ token, username })
}
