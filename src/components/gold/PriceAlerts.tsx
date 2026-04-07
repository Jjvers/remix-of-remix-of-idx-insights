import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import type { GoldInstrument } from '@/types/gold';
import type { LiveGoldPrices } from '@/hooks/useGoldPrices';
import { useToast } from '@/hooks/use-toast';
import { sendTelegramMessage } from '@/lib/telegram';
import {
  Bell, BellRing, Plus, Trash2, TrendingUp, TrendingDown,
  Volume2, CheckCircle2
} from 'lucide-react';

interface PriceAlert {
  id: string;
  instrument: GoldInstrument;
  targetPrice: number;
  condition: 'above' | 'below';
  message?: string;
  triggered: boolean;
  createdAt: Date;
}

interface PriceAlertsProps {
  livePrices?: LiveGoldPrices | null;
  selectedInstrument: GoldInstrument;
  telegramChatId?: string;
  userId?: string;
}

export function PriceAlerts({ livePrices, selectedInstrument, telegramChatId, userId }: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [newCondition, setNewCondition] = useState<'above' | 'below'>('above');
  const [newMessage, setNewMessage] = useState('');

  const { toast } = useToast();
  const { t } = useI18n();

  const scopeId = userId || 'guest';
  const STORAGE_KEY = `price_alerts_${selectedInstrument}_${scopeId}`;

  // Load alerts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAlerts(parsed.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) })));
      } else {
        setAlerts([]);
      }
    } catch {
      setAlerts([]);
    } finally {
      setIsLoaded(true);
    }
  }, [STORAGE_KEY]);

  // Persist to localStorage whenever alerts change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts, isLoaded, STORAGE_KEY]);

  const notifyTelegram = async (message: string) => {
    if (!telegramChatId) return;
    await sendTelegramMessage(telegramChatId, message);
  };

  const currentPrice = livePrices
    ? (selectedInstrument === 'XAU/USD' ? livePrices.XAU : livePrices.XAG)
    : 0;

  // Check alerts on price change
  useEffect(() => {
    if (!currentPrice) return;

    setAlerts(prev => prev.map(alert => {
      if (alert.triggered || alert.instrument !== selectedInstrument) return alert;

      const shouldTrigger =
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        const emoji = alert.condition === 'above' ? '📈' : '📉';
        toast({
          title: '🔔 Price Alert Triggered!',
          description: `${alert.instrument} ${alert.condition === 'above' ? '↑' : '↓'} $${alert.targetPrice.toFixed(2)} — Current: $${currentPrice.toFixed(2)}`,
        });

        notifyTelegram(
          `${emoji} <b>Price Alert Triggered!</b>\n\n` +
          `📊 ${alert.instrument}\n` +
          `💰 Current: $${currentPrice.toFixed(2)}\n` +
          `🎯 Target: $${alert.targetPrice.toFixed(2)} (${alert.condition})\n` +
          `${alert.message ? `\n📝 ${alert.message}` : ''}`
        );

        return { ...alert, triggered: true };
      }
      return alert;
    }));
  }, [currentPrice, selectedInstrument, toast]);

  const addAlert = async () => {
    const price = parseFloat(newPrice);
    if (!price || price <= 0) {
      toast({ title: t('alerts.invalidPrice'), variant: 'destructive' });
      return;
    }

    const alert: PriceAlert = {
      id: crypto.randomUUID(),
      instrument: selectedInstrument,
      targetPrice: price,
      condition: newCondition,
      message: newMessage || undefined,
      triggered: false,
      createdAt: new Date(),
    };
    setAlerts(prev => [alert, ...prev]);

    setNewPrice('');
    setNewMessage('');
    toast({ title: `✅ ${t('alerts.created')}`, description: `${selectedInstrument} ${newCondition} $${price.toFixed(2)}` });
  };

  const quickAlert = (pct: number, cond: 'above' | 'below') => {
    if (!currentPrice) return;
    const target = cond === 'above'
      ? currentPrice * (1 + pct / 100)
      : currentPrice * (1 - pct / 100);
    setNewPrice(target.toFixed(2));
    setNewCondition(cond);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-accent" />
          {t('alerts.title')}
          {telegramChatId && (
            <Badge variant="outline" className="text-[10px] ml-2">📱 Telegram Active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Alert Form */}
        <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">{t('alerts.targetPrice')}</Label>
              <Input
                type="number"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                placeholder={currentPrice ? currentPrice.toFixed(2) : '0.00'}
                className="h-8 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs">{t('alerts.condition')}</Label>
              <Select value={newCondition} onValueChange={(v: 'above' | 'below') => setNewCondition(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-[hsl(var(--gain))]" /> {t('alerts.above')}</span>
                  </SelectItem>
                  <SelectItem value="below">
                    <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-[hsl(var(--loss))]" /> {t('alerts.below')}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Alert Buttons */}
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] text-muted-foreground self-center mr-1">{t('alerts.quick')}</span>
            {[0.5, 1, 2, 5].map(pct => (
              <Button key={`above-${pct}`} size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-[hsl(var(--gain))]" onClick={() => quickAlert(pct, 'above')}>
                ↑+{pct}%
              </Button>
            ))}
            {[0.5, 1, 2, 5].map(pct => (
              <Button key={`below-${pct}`} size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-[hsl(var(--loss))]" onClick={() => quickAlert(pct, 'below')}>
                ↓-{pct}%
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={t('alerts.message')}
              className="h-8 text-xs"
            />
            <Button onClick={addAlert} size="sm" className="gap-1 shrink-0">
              <Plus className="h-4 w-4" /> {t('alerts.add')}
            </Button>
          </div>
        </div>

        {/* Active Alerts */}
        <div>
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Volume2 className="h-3 w-3" /> {t('alerts.active')} ({activeAlerts.length})
          </h4>
          {activeAlerts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">{t('alerts.noActive')}</p>
          ) : (
            <div className="space-y-1">
              {activeAlerts.map(alert => {
                const distancePercent = currentPrice
                  ? (((alert.targetPrice - currentPrice) / currentPrice) * 100)
                  : 0;
                return (
                  <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2">
                      <BellRing className={`h-4 w-4 ${alert.condition === 'above' ? 'text-[hsl(var(--gain))]' : 'text-[hsl(var(--loss))]'}`} />
                      <div>
                        <p className="text-sm font-mono">
                          {alert.instrument} {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {distancePercent >= 0 ? '+' : ''}{distancePercent.toFixed(2)}% {t('alerts.fromCurrent')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeAlert(alert.id)} className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Triggered */}
        {triggeredAlerts.length > 0 && (
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {t('alerts.triggered')} ({triggeredAlerts.length})
            </h4>
            <div className="space-y-1">
              {triggeredAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-muted/10 opacity-60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--gain))]" />
                    <p className="text-xs font-mono">
                      {alert.instrument} {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{t('alerts.triggered')}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
