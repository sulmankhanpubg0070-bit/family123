import { db } from './_db.js';

// Ek member ki tasveer alag se (browser cache karta hai)
export default async function handler(req, res) {
  try {
    const m = await (await db()).collection('family_members').findOne({ id: parseInt(req.query.id) }, { projection: { photo: 1 } });
    const x = /^data:(image\/[a-z+.-]+);base64,(.+)$/.exec(m?.photo || '');
    if (!x) return res.status(404).end();
    res.setHeader('Content-Type', x[1]);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(Buffer.from(x[2], 'base64'));
  } catch (e) {
    return res.status(500).end();
  }
}
