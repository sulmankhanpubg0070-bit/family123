import { MongoClient } from 'mongodb';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
let client;
export async function db() {
  if (!client) { client = new MongoClient(process.env.MONGODB_URI); await client.connect(); }
  return client.db('family_tree');
}
export const hash = p => { const s = randomBytes(16).toString('hex'); return s + ':' + scryptSync(p, s, 32).toString('hex'); };
const same = (p, h) => { const [s, x] = h.split(':'); const a = Buffer.from(scryptSync(p, s, 32).toString('hex')), b = Buffer.from(x); return a.length === b.length && timingSafeEqual(a, b); };

// 'master' | 'admin' | 'locked' | null. 5 ghalat koshishon par 15 minute ka lock.
export async function auth(d, b, req) {
  const { user, password } = b || {};
  if (!password) return null;
  const ip = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const k = ip + '|' + String(user || '').trim().toLowerCase(), c = d.collection('attempts');
  const a = await c.findOne({ _id: k });
  if (a && a.until > Date.now()) return 'locked';
  let r = null;
  if (!user) { if (password === process.env.ADMIN_PASSWORD) r = 'master'; }
  else {
    const u = await d.collection('admins').findOne({ username: String(user).trim().toLowerCase() });
    if (u && same(String(password), u.hash)) r = 'admin';
  }
  if (r) { if (a) await c.deleteOne({ _id: k }); return r; }
  const n = (a?.n || 0) + 1;
  await c.updateOne({ _id: k }, { $set: { n: n >= 5 ? 0 : n, until: n >= 5 ? Date.now() + 15 * 60000 : 0 } }, { upsert: true });
  return null;
}
// Role wapas karta hai, ya khud jawab bhej kar null
export async function gate(d, b, req, res, need) {
  const r = await auth(d, b, req);
  if (r === 'locked') { res.status(429).json({ error: 'Bohat ghalat koshishen. 15 minute baad try karein' }); return null; }
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
