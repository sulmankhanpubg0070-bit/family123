import { db, snap } from './_db.js';

// Vercel Cron har hafte chalata hai. CRON_SECRET set ho to wo check hota hai.
export default async function handler(req, res) {
  try {
    const s = process.env.CRON_SECRET;
    if (s ? req.headers.authorization !== 'Bearer ' + s : !String(req.headers['user-agent']).includes('vercel-cron'))
      return res.status(401).json({ error: 'Unauthorized' });
    await snap(await db(), 'weekly');
    return res.status(200).json({ ok: 1 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
