import { db, auth } from './_db.js';

const SAMPLE = [
  { id: 1, name: 'Dada Ji', father: null, gender: 'M' },
  { id: 2, name: 'Ahmad', father: 1, gender: 'M' },
  { id: 3, name: 'Bilal', father: 1, gender: 'M' },
  { id: 4, name: 'Aisha', father: 1, gender: 'F' },
  { id: 5, name: 'Usman', father: 2, gender: 'M' },
  { id: 6, name: 'Fatima', father: 2, gender: 'F' },
  { id: 7, name: 'Hamza', father: 3, gender: 'M' }
];

export default async function handler(req, res) {
  try {
    const d = await db(), c = d.collection('family_members');
    if ((await c.countDocuments()) === 0) await c.insertMany(SAMPLE);

    if (req.method === 'GET') return res.status(200).json(await c.find().toArray());

    const b = req.body || {};
    if (!(await auth(d, b))) return res.status(401).json({ error: 'Unauthorized - Invalid login' });
    const { password, user, members, ...data } = b;

    if (req.method === 'POST') {
      if (Array.isArray(members)) {
        if (!members.length) return res.status(400).json({ error: 'Empty list' });
        await c.deleteMany({});
        await c.insertMany(members);
        return res.status(201).json({ success: true });
      }
      const r = await c.insertOne(data);
      return res.status(201).json({ ...data, _id: r.insertedId });
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = data;
      await c.updateOne({ id: parseInt(id) }, { $set: rest });
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const id = parseInt(data.id);
      await c.deleteOne({ id });
      await c.updateMany({ father: id }, { $set: { father: null } });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
