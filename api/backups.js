import { db, gate, log, snap } from './_db.js';

// Backups: list / create / restore (har admin kar sakta hai)
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const d = await db(), b = req.body || {}, role = await gate(d, b, req, res);
    if (!role) return;
    const c = d.collection('backups'), who = b.user || 'master';
    if (b.op === 'list') {
      const l = await c.aggregate([{ $sort: { t: -1 } }, { $project: { t: 1, label: 1, n: { $size: '$members' } } }]).toArray();
      return res.status(200).json(l.map(x => ({ t: x.t, label: x.label, n: x.n })));
    }
    if (b.op === 'create') { await snap(d, 'manual'); await log(d, who, 'backup', 'manual'); return res.status(200).json({ ok: 1 }); }
    if (b.op === 'restore') {
      const s = await c.findOne({ t: +b.t });
      if (!s || !Array.isArray(s.members)) return res.status(404).json({ error: 'Backup nahi mila' });
      await snap(d, 'before-restore');
      const m = d.collection('family_members');
      await m.deleteMany({});
      if (s.members.length) await m.insertMany(s.members);
      await log(d, who, 'restore-backup', new Date(s.t).toISOString().slice(0, 16));
      return res.status(200).json({ ok: 1 });
    }
    return res.status(400).json({ error: 'Bad op' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
