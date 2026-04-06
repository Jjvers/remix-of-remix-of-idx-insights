import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { s, f, h, e } = req.query;
    const params = new URLSearchParams();
    if (s) params.set('s', String(s));
    if (f) params.set('f', String(f));
    if (h !== undefined) params.set('h', '');
    if (e) params.set('e', String(e));

    const url = `https://stooq.com/q/l/?${params.toString()}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const text = await response.text();
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Stooq', details: String(err) });
  }
}
