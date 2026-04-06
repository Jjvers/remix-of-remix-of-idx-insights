import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Extract the path after /api/telegram/
    // e.g. /api/telegram/bot123:ABC/sendMessage → bot123:ABC/sendMessage
    const slugParts = req.query.slug;
    const pathParts = Array.isArray(slugParts) ? slugParts.join('/') : String(slugParts || '');

    if (!pathParts) {
      return res.status(400).json({ error: 'Missing Telegram API path' });
    }

    const url = `https://api.telegram.org/${pathParts}`;
    
    const fetchOpts: RequestInit = {
      method: req.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
    };

    if (req.method === 'POST' && req.body) {
      fetchOpts.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOpts);
    const data = await response.json();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to call Telegram API', details: String(err) });
  }
}
