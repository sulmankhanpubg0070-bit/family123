import { db, gate, hash, same, log, mint } from './_db.js';

// list/save/delete: sirf master. mypass: har admin apna password badal sakta hai.
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const d = await db(), c = d.collection('admins'), b = req.body || {};
    const me = await gate(d, b, req, res);
    if (!me) return;
    if (b.action === 'mypass') {
      if (me.role !== 'admin') return res.status(400).json({ error: 'Master ka password Vercel (ADMIN_PASSWORD) mein hai' });
      const u = await c.findOne({ username: me.user });
      if (!u || !same(String(b.oldPassword || ''), u.hash)) return res.status(401).json({ error: 'Purana password ghalat' });
      if (String(b.newPassword || '').length < 6) return res.status(400).json({ error: 'Naya password kam az kam 6 harf' });
      const h = hash(String(b.newPassword));
      await c.updateOne({ username: me.user }, { $set: { hash: h } });
      await log(d, me.user, 'password', 'apna password badla');
      return res.status(200).json({ success: true, token: mint(me.user, 'admin', h.slice(-10)) });
    }
    if (me.role !== 'master') return res.status(401).json({ error: 'Sirf master admin' });
    if (b.action === 'list') return res.status(200).json((await c.find().toArray()).map(x => x.username));
    const u = String(b.username || '').trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(u)) return res.status(400).json({ error: 'Username 3-20 harf (a-z, 0-9, _)' });
    if (b.action === 'delete') { await c.deleteOne({ username: u }); await log(d, 'master', 'admin-delete', u); return res.status(200).json({ success: true }); }
    if (b.action === 'save') {
      if (String(b.userPassword || '').length < 6) return res.status(400).json({ error: 'Password kam az kam 6 harf' });
      await c.updateOne({ username: u }, { $set: { username: u, hash: hash(String(b.userPassword)) } }, { upsert: true });
      await log(d, 'master', 'admin-save', u);
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Bad action' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
