import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

async function sendTelegramAlert(message: string, chatId: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    console.warn('Telegram keys not configured');
    return;
  }

  try {
    const response = await fetch(`${TELEGRAM_GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error(`Telegram failed [${response.status}]:`, data);
    }
  } catch (err) {
    console.error('Telegram error:', err);
  }
}

async function fetchCurrentGoldPrice(): Promise<number | null> {
  // Try GoldAPI first
  const GOLDAPI_KEY = Deno.env.get('GOLDAPI_API_KEY');
  if (GOLDAPI_KEY) {
    try {
      const res = await fetch('https://www.goldapi.io/api/XAU/USD', {
        headers: { 'x-access-token': GOLDAPI_KEY, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.price) return data.price;
      }
    } catch (e) {
      console.error('GoldAPI error:', e);
    }
  }

  // Fallback to MetalPrice
  const METALPRICE_KEY = Deno.env.get('METALPRICE_API_KEY');
  if (METALPRICE_KEY) {
    try {
      const res = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${METALPRICE_KEY}&base=XAU&currencies=USD`);
      if (res.ok) {
        const data = await res.json();
        if (data.rates?.USD) return 1 / data.rates.USD;
      }
    } catch (e) {
      console.error('MetalPrice error:', e);
    }
  }

  return null;
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current gold price
    const currentPrice = await fetchCurrentGoldPrice();
    if (!currentPrice) {
      return new Response(JSON.stringify({ success: false, error: 'Could not fetch price' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Current XAU/USD: $${currentPrice.toFixed(2)}`);

    // Get all untriggered alerts with their user's telegram chat ID
    const { data: alerts, error: alertsError } = await supabase
      .from('price_alerts')
      .select('id, instrument, target_price, condition, message, user_id')
      .eq('triggered', false);

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      return new Response(JSON.stringify({ success: false, error: alertsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ success: true, checked: 0, triggered: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let triggeredCount = 0;

    for (const alert of alerts) {
      // Only check XAU/USD alerts for now (can extend to XAG later)
      if (alert.instrument !== 'XAU/USD') continue;

      const targetPrice = Number(alert.target_price);
      const shouldTrigger =
        (alert.condition === 'above' && currentPrice >= targetPrice) ||
        (alert.condition === 'below' && currentPrice <= targetPrice);

      if (shouldTrigger) {
        // Mark as triggered
        await supabase
          .from('price_alerts')
          .update({ triggered: true, triggered_at: new Date().toISOString() })
          .eq('id', alert.id);

        // Get user's telegram chat ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('telegram_chat_id')
          .eq('id', alert.user_id)
          .single();

        if (profile?.telegram_chat_id) {
          const emoji = alert.condition === 'above' ? '📈' : '📉';
          const msg = `${emoji} <b>Price Alert Triggered!</b>\n\n` +
            `📊 ${alert.instrument}\n` +
            `💰 Current: $${currentPrice.toFixed(2)}\n` +
            `🎯 Target: $${targetPrice.toFixed(2)} (${alert.condition})\n` +
            `${alert.message ? `\n📝 ${alert.message}` : ''}\n\n` +
            `<i>🔔 Server-side alert — works even when you're offline!</i>`;
          await sendTelegramAlert(msg, profile.telegram_chat_id);
        }

        triggeredCount++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      checked: alerts.length, 
      triggered: triggeredCount,
      price: currentPrice 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Check alerts error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
