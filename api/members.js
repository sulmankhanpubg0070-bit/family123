import { db, gate, log, snap, sign } from './_db.js';

const SAMPLE = [
  { id: 1, name: 'Dada Ji', father: null, gender: 'M' },
  { id: 2, name: 'Ahmad', father: 1, gender: 'M' },
  { id: 3, name: 'Bilal', father: 1, gender: 'M' },
  { id: 4, name: 'Aisha', father: 1, gender: 'F' },
  { id: 5, name: 'Usman', father: 2, gender: 'M' },
  { id: 6, name: 'Fatima', father: 2, gender: 'F' },
  { id: 7, name: 'Hamza', father: 3, gender: 'M' }
];
const num = v => (v === null || v === undefined || v === '' ? null : Number.isFinite(+v) ? +v : null);
const str = (v, n) => String(v ?? '').trim().slice(0, n);
function clean(m) {
  if (!m || typeof m !== 'object' || !Number.isFinite(+m.id) || !str(m.name, 80)) return null;
  const o = {
    id: +m.id, name: str(m.name, 80), father: num(m.father), mother: num(m.mother),
    gender: m.gender === 'F' ? 'F' : 'M', dob: str(m.dob, 10), phone: str(m.phone, 30),
    spouse: str(m.spouse, 80), dead: !!m.dead
  };
  // Photo sirf tab badalti hai jab nayi bheji jaye
  if (typeof m.photo === 'string' && m.photo.startsWith('data:image/') && m.photo.length < 30000) { o.photo = m.photo; o.pv = Date.now(); }
  return o;
}
// List mein tasveer ka data nahi jata (site tez rehti hai), sirf hasPhoto
const pipe = proj => [{ $addFields: { hasPhoto: { $gt: [{ $strLenCP: { $ifNull: ['$photo', ''] } }, 0] } } }, { $project: proj }];
// Server ka token 12 ghante chalta hai; 3 ghante ki hadd browser lagata hai (kaam beech mein na ruke)
const TOKEN_MS = 12 * 3600e3;

export default async function handler(req, res) {
  try {
    const d = await db(), c = d.collection('family_members'), tr = d.collection('trash');
    if ((await c.countDocuments()) === 0) await c.insertMany(SAMPLE);
    // Public list: phone aur photo data ke baghair
    if (req.method === 'GET') return res.status(200).json(await c.aggregate(pipe({ photo: 0, phone: 0 })).toArray());
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const b = req.body || {}, role = await gate(d, b, req, res);
    if (!role) return;
    const who = b.user || 'master', id = parseInt(b.id), noDel = role === 'editor';
    const deny = () => res.status(403).json({ error: 'Is account ko delete/import ki ijazat nahi' });

    switch (b.op) {
      case 'ping': return res.status(200).json({ ok: 1, role, user: b.user || '' });
      case 'login': return res.status(200).json({ ok: 1, role, user: b.user || '', token: sign({ u: b.user || '', exp: Date.now() + TOKEN_MS }) });
      case 'list': return res.status(200).json(await c.aggregate(pipe({ photo: 0 })).toArray());
      case 'upsert': {
        const m = clean(b.member);
        if (!m) return res.status(400).json({ error: 'Member ka data sahi nahi' });
        await c.updateOne({ id: m.id }, { $set: m }, { upsert: true });
        await log(d, who, 'save', m.name);
        return res.status(200).json({ ok: 1 });
      }
      case 'remove': {
        if (noDel) return deny();
        const m = await c.findOne({ id });
        if (!m) return res.status(200).json({ ok: 1 });
        await tr.insertOne({ ...m, _del: Date.now(), _by: who });
        await c.deleteOne({ id });
        await c.updateMany({ father: id }, { $set: { father: null } });
        await c.updateMany({ mother: id }, { $set: { mother: null } });
        await log(d, who, 'delete', m.name);
        return res.status(200).json({ ok: 1 });
      }
      case 'trash': return res.status(200).json(await tr.find({}, { projection: { photo: 0 } }).sort({ _del: -1 }).limit(30).toArray());
      case 'restore': {
        if (noDel) return deny();
        const m = await tr.findOne({ id });
        if (!m) return res.status(404).json({ error: 'Nahi mila' });
        const { _id, _del, _by, ...rest } = m;
        await c.updateOne({ id }, { $set: rest }, { upsert: true });
        await tr.deleteOne({ id });
        await log(d, who, 'restore', m.name);
        return res.status(200).json({ ok: 1 });
      }
      case 'audit':
        if (role !== 'master') return res.status(401).json({ error: 'Sirf master' });
        return res.status(200).json(await d.collection('audit').find().sort({ t: -1 }).limit(40).toArray());
      case 'import': {
        if (noDel) return deny();
        const list = Array.isArray(b.members) ? b.members.map(clean) : [];
        if (!list.length || list.some(x => !x) || new Set(list.map(x => x.id)).size !== list.length)
          return res.status(400).json({ error: 'File sahi nahi (id/naam check karein)' });
        await snap(d, 'before-import');
        await c.deleteMany({});
        await c.insertMany(list);
        await log(d, who, 'import', list.length + ' members');
        return res.status(200).json({ ok: 1 });
      }
      default: return res.status(400).json({ error: 'Bad op' });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
