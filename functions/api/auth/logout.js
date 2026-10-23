import { json, sha256hex, bearerToken } from '../../../server/auth.js'

export async function onRequestPost({ request, env }) {
  await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(await sha256hex(bearerToken(request))).run()
  return json({ ok: true })
}
