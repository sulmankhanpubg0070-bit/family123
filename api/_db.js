import { MongoClient } from 'mongodb';
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto';
let client;
export async function db() {
  if (!client) {
    const c = new MongoClient(String(process.env.MONGODB_URI || '').trim(), { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    await c.connect();
    client = c;
  }
  return client.db('family_tree');
}
export const hash = p => { const s = randomBytes(16).toString('hex'); return s + ':' + scryptSync(p, s, 32).toString('hex'); };
const same = (p, h) => { const [s, x] = h.split(':'); const a = Buffer.from(scryptSync(p, s, 32).toString('hex')), b = Buffer.from(x); return a.length === b.length && timingSafeEqual(a, b); };

// Login token (7 din): browser mein password nahi, sirf signed token rehta hai
const sec = () => process.env.TOKEN_SECRET || process.env.ADMIN_PASSWORD || '';
export const sign = p => { const b = Buffer.from(JSON.stringify(p)).toString('base64url'); return b + '.' + createHmac('sha256', sec()).update(b).digest('base64url'); };
function verify(t) {
  const [b, s] = String(t || '').split('.');
  if (!b || !s || !sec()) return null;
  const e = createHmac('sha256', sec()).update(b).digest('base64url');
  if (e.length !== s.length || !timingSafeEqual(Buffer.from(e), Buffer.from(s))) return null;
  try { const p = JSON.parse(Buffer.from(b, 'base64url').toString()); return p.exp > Date.now() ? p : null; } catch (e) { return null; }
}

const LOCK = 2 * 60000; // 5 ghalat koshishon ke baad 2 minute ka lock
// 'master' | 'admin' | 'editor' (delete ki ijazat nahi) | 'locked' | null
export async function auth(d, b, req) {
  if (b && b.token) {
    const p = verify(b.token);
    if (!p) return null;
    if (!p.u) return 'master';
    const u = await d.collection('admins').findOne({ username: p.u });
    if (!u) return null;
    b.user = p.u;
    return u.editor ? 'editor' : 'admin';
  }
  const { user, password } = b || {};
  if (!password) return null;
  const ip = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const k = ip + '|' + String(user || '').trim().toLowerCase(), c = d.collection('attempts');
  let a = await c.findOne({ _id: k });
  if (a && a.until - Date.now() > LOCK) { await c.deleteOne({ _id: k }); a = null; }
  if (a && a.until > Date.now()) return 'locked';
  let r = null;
  if (!user) { if (process.env.ADMIN_PASSWORD && String(password).trim() === String(process.env.ADMIN_PASSWORD).trim()) r = 'master'; }
  else {
    const u = await d.collection('admins').findOne({ username: String(user).trim().toLowerCase() });
    if (u && same(String(password), u.hash)) { r = u.editor ? 'editor' : 'admin'; b.user = u.username; }
  }
  if (r) { if (a) await c.deleteOne({ _id: k }); return r; }
  const n = (a?.n || 0) + 1;
  await c.updateOne({ _id: k }, { $set: { n: n >= 5 ? 0 : n, until: n >= 5 ? Date.now() + LOCK : 0 } }, { upsert: true });
  return null;
}
export async function gate(d, b, req, res, need) {
  const r = await auth(d, b, req);
  if (r === 'locked') { res.status(429).json({ error: 'Bohat ghalat koshishen. 2 minute baad try karein' }); return null; }
  if (!r || (need === 'master' && r !== 'master')) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  return r;
}
export const log = (d, who, action, detail) => d.collection('audit').insertOne({ t: Date.now(), who, action, detail: String(detail || '').slice(0, 100) });
export async function snap(d, label) {
  const c = d.collection('backups');
  await c.insertOne({ t: Date.now(), label, members: await d.collection('family_members').find().toArray() });
  const old = await c.find({}, { projection: { _id: 1 } }).sort({ t: -1 }).skip(8).toArray();
  if (old.length) await c.deleteMany({ _id: { $in: old.map(x => x._id) } });
}
