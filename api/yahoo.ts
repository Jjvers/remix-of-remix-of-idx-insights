import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { symbol, interval, range } = req.query;
    const sym = String(symbol || 'GC=F');
    const int = String(interval || '1d');
    const rng = String(range || '1y');

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=${int}&range=${rng}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const data = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Yahoo Finance', details: String(err) });
  }
}
