/**
 * Send a Telegram message directly via Bot API (no Supabase needed)
 * Uses the local Vite proxy /api/telegram to avoid CORS
 */
export function getTelegramBotToken(): string {
  return localStorage.getItem('telegram_bot_token') || import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
}

export function setTelegramBotToken(token: string) {
  localStorage.setItem('telegram_bot_token', token.trim());
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  const botToken = getTelegramBotToken();
  if (!botToken) {
    console.error('Telegram Bot Token not configured');
    return false;
  }
  if (!chatId) return false;

  try {
    const res = await fetch(`/api/telegram/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram API error:', data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Telegram send error:', err);
    return false;
  }
}
