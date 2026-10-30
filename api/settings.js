import { db, auth } from './_db.js';

const DEF = { siteName: 'Family Shajra', tagline: '', about: 'Ye website hamari family ka shajra dekhne aur save karne ke liye hai.' };

export default async function handler(req, res) {
  try {
    const d = await db(), c = d.collection('settings');
    if (req.method === 'GET') {
      const s = (await c.findOne({ _id: 'site' })) || {};
      return res.status(200).json({ siteName: s.siteName || DEF.siteName, tagline: s.tagline ?? DEF.tagline, about: s.about ?? DEF.about });
    }
    if (req.method === 'POST') {
      const { user, password, ...s } = req.body || {};
      if (!(await auth(d, { user, password }))) return res.status(401).json({ error: 'Unauthorized' });
      const clean = {
        siteName: String(s.siteName || DEF.siteName).slice(0, 60),
        tagline: String(s.tagline || '').slice(0, 120),
        about: String(s.about || '').slice(0, 2000)
      };
      await c.updateOne({ _id: 'site' }, { $set: clean }, { upsert: true });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
