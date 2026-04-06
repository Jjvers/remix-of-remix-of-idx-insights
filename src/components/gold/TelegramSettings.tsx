import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';
import { sendTelegramMessage, getTelegramBotToken, setTelegramBotToken } from '@/lib/telegram';
import {
  Send, Bot, CheckCircle2, Settings, Key, Eye, EyeOff, RefreshCw, Scan
} from 'lucide-react';

interface TelegramSettingsProps {
  chatId: string;
  onChatIdChange: (id: string) => void;
}

export function TelegramSettings({ chatId, onChatIdChange }: TelegramSettingsProps) {
  const [inputChatId, setInputChatId] = useState(chatId);
  const [botToken, setBotToken] = useState('');
  const [botName, setBotName] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    setInputChatId(chatId);
    setIsConnected(!!chatId);
  }, [chatId]);

  useEffect(() => {
    const savedToken = getTelegramBotToken();
    if (savedToken) {
      setBotToken(savedToken);
      fetchBotName(savedToken);
    }
  }, []);

  const fetchBotName = async (token: string) => {
    try {
      const res = await fetch(`/api/telegram/bot${token}/getMe`);
      const data = await res.json();
      if (data.ok) setBotName(data.result.username);
    } catch {}
  };

  const saveBotToken = async () => {
    if (!botToken.trim()) {
      toast({ title: '❌ Bot Token is empty', variant: 'destructive' });
      return;
    }
    setTelegramBotToken(botToken.trim());
    await fetchBotName(botToken.trim());
    toast({ title: '✅ Bot Token Saved!' });
  };

  const saveChatId = () => {
    if (!inputChatId.trim()) return;
    onChatIdChange(inputChatId.trim());
    setIsConnected(true);
    toast({ title: `✅ ${t('telegram.savedSuccess')}`, description: `Chat ID: ${inputChatId.trim()}` });
  };

  // Auto-detect Chat ID from getUpdates — user just needs to have sent /start to the bot
  const detectChatId = async () => {
    const token = getTelegramBotToken();
    if (!token) {
      toast({ title: '❌ Token not configured', variant: 'destructive' });
      return;
    }
    setIsDetecting(true);
    try {
      const res = await fetch(`/api/telegram/bot${token}/getUpdates?limit=10&offset=-10`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.description);

      const updates = data.result;
      if (updates.length === 0) {
        toast({
          title: '⚠️ No messages found',
          description: `Open @${botName || 'your bot'} in Telegram, click START first, then try again.`,
          variant: 'destructive'
        });
        return;
      }

      const latest = updates[updates.length - 1];
      const detectedId = String(
        latest.message?.chat?.id ||
        latest.callback_query?.message?.chat?.id ||
        ''
      );
      if (!detectedId) throw new Error('No chat ID');

      setInputChatId(detectedId);
      onChatIdChange(detectedId);
      setIsConnected(true);
      toast({ title: '🎯 Chat ID Detected!', description: `Chat ID: ${detectedId} — saved automatically!` });
    } catch {
      toast({ title: '❌ Detection failed', description: `Open @${botName || 'your bot'} in Telegram and click START first.`, variant: 'destructive' });
    } finally {
      setIsDetecting(false);
    }
  };

  const testConnection = async () => {
    if (!getTelegramBotToken() || !inputChatId.trim()) return;
    setIsTesting(true);
    try {
      const ok = await sendTelegramMessage(
        inputChatId.trim(),
        `🤖 <b>Gold Analysis Bot Connected!</b>\n\n✅ Telegram connected successfully!\n\nYou will receive notifications for:\n📊 Gold &amp; Silver price movements\n🎯 Take Profit &amp; Stop Loss\n📈 Trading signals\n🔔 Price alerts\n\n<i>Powered by Gold Analysis Platform</i>`
      );
      if (!ok) throw new Error('Failed');
      toast({ title: `✅ Message sent! Check your Telegram.` });
    } catch {
      toast({ title: `❌ Failed`, description: 'Please check your Bot Token and Chat ID.', variant: 'destructive' });
    } finally {
      setIsTesting(false);
    }
  };

  const disconnect = () => {
    onChatIdChange('');
    setInputChatId('');
    setIsConnected(false);
    toast({ title: t('telegram.disconnected') });
  };

  const hasBotToken = !!getTelegramBotToken();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-[hsl(199,89%,48%)]" />
            {t('telegram.title')}
            {botName && (
              <Badge variant="outline" className="text-xs font-mono">
                @{botName}
              </Badge>
            )}
          </span>
          {isConnected && hasBotToken && (
            <Badge className="bg-[hsl(var(--gain))]/20 text-[hsl(var(--gain))] border-[hsl(var(--gain))]/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> {t('telegram.connected')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Step 1: Bot Token */}
        <div className={`p-3 rounded-lg border ${hasBotToken ? 'border-gain/30 bg-gain/5' : 'border-accent/50 bg-accent/5'}`}>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Key className="h-4 w-4 text-accent" />
            Step 1: Bot Token
            {hasBotToken && <CheckCircle2 className="h-3.5 w-3.5 text-gain ml-1" />}
          </h4>
          {hasBotToken ? (
            <p className="text-xs text-gain">✅ Bot Token configured {botName && `(@${botName})`}</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-2">
                Enter your bot token from BotFather
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    value={botToken}
                    onChange={e => setBotToken(e.target.value)}
                    placeholder="1234567890:ABCdef..."
                    className="h-9 font-mono text-xs pr-9"
                  />
                  <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <Button size="sm" onClick={saveBotToken}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Save</Button>
              </div>
            </>
          )}
        </div>

        {/* Step 2: Auto-detect Chat ID */}
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Bot className="h-4 w-4 text-accent" />
            Step 2: Connect Your Telegram Account
            {isConnected && <CheckCircle2 className="h-3.5 w-3.5 text-gain ml-1" />}
          </h4>
          <div className="text-xs text-muted-foreground mb-3 space-y-1">
            <ol className="list-decimal list-inside space-y-1.5 ml-1">
              <li>
                Open your bot {botName
                  ? <a href={`https://t.me/${botName}`} target="_blank" rel="noopener noreferrer" className="text-[hsl(199,89%,48%)] underline font-medium">@{botName}</a>
                  : 'in Telegram'
                }
              </li>
              <li>Click <strong>START</strong> or send any message</li>
              <li>Click the <strong>🔍 Detect</strong> button below — Chat ID will be filled automatically!</li>
            </ol>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={inputChatId}
                onChange={e => setInputChatId(e.target.value)}
                placeholder="Chat ID (auto-filled on detect)"
                className="h-9 font-mono text-sm"
              />
              <Button size="sm" onClick={saveChatId} disabled={!inputChatId.trim()} className="shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t('telegram.save')}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={detectChatId}
              disabled={isDetecting || !hasBotToken}
              className="w-full gap-2"
            >
              {isDetecting
                ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Detecting...</>
                : <><Scan className="h-3.5 w-3.5" /> 🔍 Auto-Detect Chat ID</>
              }
            </Button>
          </div>
        </div>

        {/* Step 3: Test */}
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Settings className="h-4 w-4 text-accent" />
            Step 3: Test & Aktifkan
          </h4>
          <div className="flex gap-2">
            <Button size="sm" onClick={testConnection} disabled={isTesting || !inputChatId.trim() || !hasBotToken} className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              {isTesting ? t('telegram.sending') : t('telegram.sendTest')}
            </Button>
            {isConnected && (
              <Button size="sm" variant="destructive" onClick={disconnect}>
                {t('telegram.disconnect')}
              </Button>
            )}
          </div>
        </div>

        {/* Notification Types */}
        <div className="p-3 rounded-lg border border-border bg-muted/10">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('telegram.notifTypes')}</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: '📈', label: t('telegram.notif1') },
              { icon: '🎯', label: t('telegram.notif2') },
              { icon: '🛑', label: t('telegram.notif3') },
              { icon: '🔔', label: t('telegram.notif4') },
              { icon: '📊', label: t('telegram.notif5') },
              { icon: '⚡', label: t('telegram.notif6') },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
