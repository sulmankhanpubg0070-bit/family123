import { MongoClient } from 'mongodb';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
let client;
export async function db() {
  if (!client) { client = new MongoClient(process.env.MONGODB_URI); await client.connect(); }
  return client.db('family_tree');
}
export const hash = p => { const s = randomBytes(16).toString('hex'); return s + ':' + scryptSync(p, s, 32).toString('hex'); };
const same = (p, h) => { const [s, x] = h.split(':'); const a = Buffer.from(scryptSync(p, s, 32).toString('hex')), b = Buffer.from(x); return a.length === b.length && timingSafeEqual(a, b); };
// Returns 'master' (Vercel ADMIN_PASSWORD), 'admin' (user in DB) or null
export async function auth(d, b) {
  const { user, password } = b || {};
  if (!password) return null;
  if (!user) return password === process.env.ADMIN_PASSWORD ? 'master' : null;
  const u = await d.collection('admins').findOne({ username: String(user).trim().toLowerCase() });
  return u && same(String(password), u.hash) ? 'admin' : null;
}
