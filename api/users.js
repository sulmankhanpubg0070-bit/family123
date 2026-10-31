import { db, gate, hash, log } from './_db.js';

// Sirf master admin (Vercel ADMIN_PASSWORD) is API ko use kar sakta hai
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const d = await db(), c = d.collection('admins'), b = req.body || {};
    if (!(await gate(d, b, req, res, 'master'))) return;
    if (b.action === 'list') return res.status(200).json((await c.find().toArray()).map(x => ({ username: x.username, editor: !!x.editor })));
    const u = String(b.username || '').trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(u)) return res.status(400).json({ error: 'Username 3-20 harf (a-z, 0-9, _)' });
    if (b.action === 'delete') { await c.deleteOne({ username: u }); await log(d, 'master', 'admin-delete', u); return res.status(200).json({ success: true }); }
    if (b.action === 'save') {
      if (String(b.userPassword || '').length < 6) return res.status(400).json({ error: 'Password kam az kam 6 harf' });
      await c.updateOne({ username: u }, { $set: { username: u, hash: hash(String(b.userPassword)), editor: !!b.noDelete } }, { upsert: true });
      await log(d, 'master', 'admin-save', u + (b.noDelete ? ' (delete nahi)' : ''));
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Bad action' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
