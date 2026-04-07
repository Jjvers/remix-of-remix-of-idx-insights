import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Since we are in the backend /api folder, we use native fetch or equivalent
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET/POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
    const telegramToken = process.env.VITE_TELEGRAM_BOT_TOKEN || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Latest Asset Prices (Gold & Silver minimum)
    // We can use Yahoo directly internally
    const fetchPrice = async (symbol: string) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const data = await response.json();
      const meta = data.chart?.result?.[0]?.meta;
      return meta?.regularMarketPrice || 0;
    };

    const [goldPrice, silverPrice] = await Promise.all([
      fetchPrice('GC=F'), // Gold
      fetchPrice('SI=F'), // Silver
    ]);

    if (!goldPrice || !silverPrice) {
      throw new Error('Failed to fetch live prices');
    }

    // 2. Fetch all active alerts from Supabase
    const { data: alerts, error: alertsError } = await supabase
      .from('price_alerts')
      .select('id, user_id, instrument, condition, target_price, message, triggered')
      .eq('triggered', false);

    if (alertsError || !alerts) {
      throw new Error(`Supabase error: ${alertsError?.message}`);
    }

    // 3. Process each alert
    const triggeredIds: string[] = [];
    const notificationsToSend: { userId: string, message: string }[] = [];

    for (const alert of alerts) {
      const livePrice = alert.instrument.includes('XAG') ? silverPrice : goldPrice;

      let isTriggered = false;
      if (alert.condition === 'ABOVE' && livePrice >= alert.target_price) isTriggered = true;
      if (alert.condition === 'BELOW' && livePrice <= alert.target_price) isTriggered = true;

      if (isTriggered) {
        triggeredIds.push(alert.id);
        notificationsToSend.push({ userId: alert.user_id, message: alert.message || `Alert Triggered! ${alert.instrument} hit ${alert.target_price}` });
      }
    }

    // 4. Update Triggered Alerts in DB
    if (triggeredIds.length > 0) {
      await supabase
        .from('price_alerts')
        .update({ triggered: true, triggered_at: new Date().toISOString() })
        .in('id', triggeredIds);
    }

    // 5. Send Telegram Messages based on Profile chat_id
    if (notificationsToSend.length > 0 && telegramToken) {
      // Get unique users
      const userIds = [...new Set(notificationsToSend.map(n => n.userId))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, telegram_chat_id')
        .in('id', userIds);

      const userChatMap: Record<string, string> = {};
      if (profiles) {
        profiles.forEach(p => {
          if (p.telegram_chat_id) userChatMap[p.id] = p.telegram_chat_id;
        });
      }

      // Send telegrams sequentially
      for (const notif of notificationsToSend) {
        const chatId = userChatMap[notif.userId];
        if (chatId) {
          try {
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: `${notif.message}\n\n<i>Harga Live: ${notif.message.includes('XAG') ? silverPrice : goldPrice}</i>\n[⚠️ Offline Tracker]`,
                parse_mode: 'HTML'
              })
            });
          } catch (e) {
            console.error('Failed to dispatch telegram', e);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      time: new Date().toISOString(),
      prices: { gold: goldPrice, silver: silverPrice },
      processed: alerts.length,
      triggered: triggeredIds.length
    });

  } catch (err: any) {
    console.error('Cron Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
