import { db, auth } from './_db.js';

// Ek member ki tasveer alag se. Female ki tasveer sirf token (?t=) ke saath milti hai.
export default async function handler(req, res) {
  try {
    const d = await db();
    const m = await d.collection('family_members').findOne({ id: parseInt(req.query.id) }, { projection: { photo: 1, gender: 1 } });
    if (m?.gender === 'F') {
      const r = await auth(d, { token: String(req.query.t || '') }, req);
      if (!r || r === 'locked') return res.status(401).end();
    }
    const x = /^data:(image\/[a-z+.-]+);base64,(.+)$/.exec(m?.photo || '');
    if (!x) return res.status(404).end();
    res.setHeader('Content-Type', x[1]);
    res.setHeader('Cache-Control', m.gender === 'F' ? 'private, max-age=3600' : 'public, max-age=31536000, immutable');
    return res.status(200).send(Buffer.from(x[2], 'base64'));
  } catch (e) {
    return res.status(500).end();
  }
}
