import { db, gate, log } from './_db.js';

const DEF = { siteName: 'Family Shajra', tagline: '', about: 'Ye website hamari family ka shajra dekhne aur save karne ke liye hai.' };

export default async function handler(req, res) {
  try {
    const d = await db(), c = d.collection('settings');
    if (req.method === 'GET') {
      const s = (await c.findOne({ _id: 'site' })) || {};
      return res.status(200).json({ siteName: s.siteName || DEF.siteName, tagline: s.tagline ?? DEF.tagline, about: s.about ?? DEF.about, defaultRoot: s.defaultRoot ?? null });
    }
    if (req.method === 'POST') {
      const b = req.body || {}, role = await gate(d, b, req, res);
      if (!role) return;
      const dr = Number(b.defaultRoot);
      const clean = {
        siteName: String(b.siteName || DEF.siteName).slice(0, 60),
        tagline: String(b.tagline || '').slice(0, 120),
        about: String(b.about || '').slice(0, 2000),
        defaultRoot: b.defaultRoot && Number.isFinite(dr) ? dr : null
      };
      await c.updateOne({ _id: 'site' }, { $set: clean }, { upsert: true });
      await log(d, b.user || 'master', 'settings', clean.siteName);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
