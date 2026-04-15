import { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type LiveGoldPrices } from '@/hooks/useGoldPrices';
import { 
  TrendingUp, TrendingDown, DollarSign, Percent, 
  Activity, AlertTriangle, Scale, Landmark 
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export interface FundamentalPanelProps {
  livePrices?: LiveGoldPrices | null;
}

export const FundamentalPanel = forwardRef<HTMLDivElement, FundamentalPanelProps>(
  function FundamentalPanel({ livePrices }, ref) {
    const { t } = useI18n();
    // Fallback to defaults if no live prices
    const DXY = livePrices?.dxy.price || 102.50;
    const DXY_change = livePrices?.dxy.changePercent || 0;
    const Yield = livePrices?.yield10y.price || 4.25;
    const VIX = livePrices?.vix.price || 15.50;
    const GoldSilverRatio = livePrices?.goldSilverRatio || 85.0;
    const CPI = 2.4; // Usually monthly data, not live tick
    const RealYield = Yield - CPI;

    // Calculate overall fundamental score
    const calculateFundamentalScore = () => {
      let score = 50;
      
      // USD weakness is bullish for gold
      if (DXY_change < 0) score += Math.min(Math.abs(DXY_change) * 10, 15);
      else score -= Math.min(DXY_change * 10, 15);
      
      // High VIX (fear) is bullish for gold
      if (VIX > 25) score += 15;
      else if (VIX > 20) score += 10;
      
      // Negative real yields are bullish for gold
      if (RealYield < 0) score += 15;
      else if (RealYield < 1) score += 5;
      else score -= 10;
      
      return Math.min(Math.max(Math.round(score), 0), 100);
    };

    const fundamentalScore = calculateFundamentalScore();

    const indicators = [
      {
        label: 'USD Index (DXY)',
        value: DXY.toFixed(2),
        change: DXY_change,
        impact: DXY_change < 0 ? 'bullish' : 'bearish',
        description: t('fundamental.dxy.desc'),
        icon: <DollarSign className="h-4 w-4" />,
        insight: DXY_change < 0 
          ? t('fundamental.dxy.bullish') 
          : t('fundamental.dxy.bearish')
      },
      {
        label: 'US 10Y Yield',
        value: `${Yield.toFixed(3)}%`,
        impact: Yield > 4.5 ? 'bearish' : Yield < 3.5 ? 'bullish' : 'neutral',
        description: t('fundamental.yield.desc'),
        icon: <Landmark className="h-4 w-4" />,
        insight: Yield > 4.5 
          ? t('fundamental.yield.bearish') 
          : t('fundamental.yield.bullish')
      },
      {
        label: 'Real Yield (est)',
        value: `${RealYield.toFixed(2)}%`,
        impact: RealYield > 1.5 ? 'bearish' : RealYield < 0 ? 'bullish' : 'neutral',
        description: t('fundamental.realYield.desc'),
        icon: <Percent className="h-4 w-4" />,
        insight: RealYield < 0 
          ? t('fundamental.realYield.bullish') 
          : t('fundamental.realYield.bearish')
      },
      {
        label: 'VIX (Fear Index)',
        value: VIX.toFixed(2),
        impact: VIX > 22 ? 'bullish' : 'neutral',
        description: t('fundamental.vix.desc'),
        icon: <AlertTriangle className="h-4 w-4" />,
        insight: VIX > 25 
          ? t('fundamental.vix.bullish_high') 
          : VIX > 20 
            ? t('fundamental.vix.bullish_medium') 
            : t('fundamental.vix.neutral')
      },
      {
        label: 'Gold/Silver Ratio',
        value: GoldSilverRatio.toFixed(1),
        impact: GoldSilverRatio > 85 ? 'neutral' : 'bullish',
        description: t('fundamental.gsRatio.desc'),
        icon: <Scale className="h-4 w-4" />,
        insight: GoldSilverRatio > 85 
          ? t('fundamental.gsRatio.neutral') 
          : t('fundamental.gsRatio.bullish')
      }
    ];

    const impactStyles = {
      bullish: 'bg-gain/10 text-gain border-gain/30',
      bearish: 'bg-loss/10 text-loss border-loss/30',
      neutral: 'bg-muted text-muted-foreground border-border'
    };

    const impactBadge = {
      bullish: t('anal.bullish'),
      bearish: t('anal.bearish'),
      neutral: t('anal.neutral')
    };

    return (
      <Card ref={ref}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              {t('tab.fundamental')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('trade.score')}:</span>
              <Badge className={fundamentalScore >= 60 ? 'bg-gain' : fundamentalScore >= 40 ? 'bg-muted' : 'bg-loss'}>
                {fundamentalScore}/100
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {indicators.map((indicator, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg border transition-colors ${impactStyles[indicator.impact]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <div className="p-1.5 rounded bg-background/50 mt-0.5">
                    {indicator.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{indicator.label}</p>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {impactBadge[indicator.impact]}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">{indicator.insight}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-semibold">{indicator.value}</p>
                  {indicator.change !== undefined && (
                    <div className="flex items-center justify-end gap-1 text-xs mt-0.5">
                      {indicator.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{indicator.change >= 0 ? '+' : ''}{indicator.change.toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                fundamentalScore >= 60 ? 'bg-gain' : 
                fundamentalScore >= 40 ? 'bg-yellow-500' : 'bg-loss'
              }`} />
              <p className="text-sm font-medium">
                {fundamentalScore >= 60 ? t('fundamental.summary.bullish.title') : 
                 fundamentalScore >= 40 ? t('fundamental.summary.mixed.title') : 
                 t('fundamental.summary.bearish.title')}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {fundamentalScore >= 60 
                ? t('fundamental.summary.bullish.desc')
                : fundamentalScore >= 40
                  ? t('fundamental.summary.mixed.desc')
                  : t('fundamental.summary.bearish.desc')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

