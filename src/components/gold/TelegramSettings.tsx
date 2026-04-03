import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import {
  Send, Bot, CheckCircle2, Copy, ExternalLink, MessageSquare, Settings
} from 'lucide-react';

const BOT_USERNAME = 'goldaiprediction_bot';

interface TelegramSettingsProps {
  chatId: string;
  onChatIdChange: (id: string) => void;
}

export function TelegramSettings({ chatId, onChatIdChange }: TelegramSettingsProps) {
  const [inputChatId, setInputChatId] = useState(chatId);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    setInputChatId(chatId);
    setIsConnected(!!chatId);
  }, [chatId]);

  const saveChatId = () => {
    if (!inputChatId.trim()) {
      toast({ title: `❌ ${t('telegram.emptyChatId')}`, description: t('telegram.enterChatId'), variant: 'destructive' });
      return;
    }
    onChatIdChange(inputChatId.trim());
    setIsConnected(true);
    toast({ title: `✅ ${t('telegram.savedSuccess')}`, description: `Chat ID: ${inputChatId.trim()}` });
  };

  const testConnection = async () => {
    if (!inputChatId.trim()) {
      toast({ title: `❌ ${t('telegram.enterFirst')}`, variant: 'destructive' });
      return;
    }
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('price-alerts', {
        body: {
          action: 'notify',
          alert: {
            telegramChatId: inputChatId.trim(),
            message: '🤖 <b>Gold Analysis Bot Connected!</b>\n\n✅ Telegram connection successful!\n\nYou will receive notifications for:\n📊 Gold & silver price movements\n🎯 Take Profit & Stop Loss\n📈 Trading signals\n🔔 Price alerts\n\n<i>Powered by Gold Analysis Platform</i>',
          }
        }
      });
      if (error) throw error;
      toast({ title: `✅ ${t('telegram.testSent')}`, description: t('telegram.checkTelegram') });
    } catch (err) {
      toast({ title: `❌ ${t('telegram.testFailed')}`, description: t('telegram.testFailedDesc'), variant: 'destructive' });
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

  const copyBotLink = () => {
    navigator.clipboard.writeText(`https://t.me/${BOT_USERNAME}`);
    toast({ title: `📋 ${t('telegram.linkCopied')}` });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-[hsl(199,89%,48%)]" />
            {t('telegram.title')}
          </span>
          {isConnected && (
            <Badge className="bg-[hsl(var(--gain))]/20 text-[hsl(var(--gain))] border-[hsl(var(--gain))]/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> {t('telegram.connected')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1 */}
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Bot className="h-4 w-4 text-accent" />
            {t('telegram.step1Title')}
          </h4>
          <p className="text-xs text-muted-foreground mb-3">{t('telegram.step1Desc')}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.open(`https://t.me/${BOT_USERNAME}`, '_blank')}>
              <ExternalLink className="h-3.5 w-3.5" /> {t('telegram.openBot')}
            </Button>
            <Button size="sm" variant="ghost" onClick={copyBotLink} className="gap-1">
              <Copy className="h-3.5 w-3.5" /> {t('telegram.copyLink')}
            </Button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-accent" />
            {t('telegram.step2Title')}
          </h4>
          <div className="text-xs text-muted-foreground mb-3 space-y-2">
            <p><b>{t('telegram.step2Desc')}</b></p>
            <ol className="list-decimal list-inside space-y-1 ml-1">
              <li>{t('telegram.step2_1')} — <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-[hsl(199,89%,48%)] underline font-medium">open @userinfobot</a></li>
              <li>{t('telegram.step2_2')}</li>
              <li>{t('telegram.step2_3')}</li>
              <li>{t('telegram.step2_4')}</li>
            </ol>
            <p className="text-muted-foreground/70 italic">{t('telegram.step2Group')}</p>
          </div>
          <div className="flex gap-2">
            <Input value={inputChatId} onChange={e => setInputChatId(e.target.value)} placeholder={t('telegram.chatIdPlaceholder')} className="h-9 font-mono text-sm" />
            <Button size="sm" onClick={saveChatId} className="gap-1 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" /> {t('telegram.save')}
            </Button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-3 rounded-lg border border-border bg-muted/20">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Settings className="h-4 w-4 text-accent" />
            {t('telegram.step3Title')}
          </h4>
          <div className="flex gap-2">
            <Button size="sm" onClick={testConnection} disabled={isTesting || !inputChatId.trim()} className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              {isTesting ? t('telegram.sending') : t('telegram.sendTest')}
            </Button>
            {isConnected && (
              <Button size="sm" variant="destructive" onClick={disconnect} className="gap-1">
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
