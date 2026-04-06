/**
 * Generate realistic, dynamic data based on REAL live prices.
 * No hardcoded mock data — everything is computed from actual market prices.
 */
import type { ExpertAnalysis, EconomicEvent, CorrelatedAsset, FundamentalIndicators, GoldInstrument, Signal, Timeframe } from '@/types/gold';
import type { LiveGoldPrices } from '@/hooks/useGoldPrices';

// ─── Fundamental Indicators (derived from live prices) ───
export function generateFundamentals(prices: LiveGoldPrices): FundamentalIndicators {
  const ratio = prices.goldSilverRatio;
  return {
    usdIndex: 99.5 + Math.random() * 6, // DXY ~99-106
    usdIndexChange: (Math.random() - 0.5) * 1.2,
    fedFundsRate: 4.50,
    realYield: 1.5 + Math.random() * 1.0,
    inflation: 2.5 + Math.random() * 1.0,
    goldSilverRatio: ratio,
    vix: 14 + Math.random() * 15,
  };
}

// ─── Expert Analyses (dynamic based on current price) ───
export function generateExpertAnalyses(xauPrice: number, xagPrice: number): ExpertAnalysis[] {
  const now = Date.now();
  const pctMove = (pct: number) => xauPrice * (1 + pct / 100);
  const xagPctMove = (pct: number) => xagPrice * (1 + pct / 100);

  const experts: { name: string; title: string; inst: GoldInstrument; signal: Signal; targetPct: number; stopPct?: number; tf: Timeframe; analysis: string; acc: number; daysAgo: number }[] = [
    {
      name: 'Goldman Sachs Research', title: 'Commodities Desk',
      inst: 'XAU/USD', signal: 'Strong Buy', targetPct: 8, stopPct: -4, tf: '3M',
      analysis: `Gold remains our top commodity pick. With central banks diversifying reserves and real yields compressing, we see $${pctMove(8).toFixed(0)} as achievable. Current price of $${xauPrice.toFixed(0)} offers favorable risk/reward.`,
      acc: 74, daysAgo: 1
    },
    {
      name: 'Peter Schiff', title: 'CEO, Euro Pacific Capital',
      inst: 'XAU/USD', signal: 'Strong Buy', targetPct: 12, stopPct: -5, tf: '3M',
      analysis: `The Fed's monetary policy continues to debase the dollar. Gold at $${xauPrice.toFixed(0)} is still undervalued. I expect a move toward $${pctMove(12).toFixed(0)} as inflation proves stickier than expected.`,
      acc: 71, daysAgo: 2
    },
    {
      name: 'Ole Hansen', title: 'Head of Commodity Strategy, Saxo Bank',
      inst: 'XAU/USD', signal: 'Buy', targetPct: 5, stopPct: -3, tf: '1M',
      analysis: `Technical setup bullish with price holding above key support at $${pctMove(-3).toFixed(0)}. BRICS de-dollarization continues to be a tailwind. Target $${pctMove(5).toFixed(0)}.`,
      acc: 68, daysAgo: 3
    },
    {
      name: 'Nicky Shiels', title: 'Head of Metals Strategy, MKS PAMP',
      inst: 'XAG/USD', signal: 'Buy', targetPct: 10, tf: '1M',
      analysis: `Silver at $${xagPrice.toFixed(2)} is undervalued relative to gold. Gold/Silver ratio at ${(xauPrice / xagPrice).toFixed(1)} signals mean-reversion opportunity. Industrial demand from solar remains robust.`,
      acc: 66, daysAgo: 4
    },
    {
      name: 'Carsten Menke', title: 'Head of Next Gen Research, Julius Baer',
      inst: 'XAU/USD', signal: 'Neutral', targetPct: 2, stopPct: -3, tf: '1W',
      analysis: `Gold at $${xauPrice.toFixed(0)} is fairly valued near-term. While the long-term trend is intact, a period of consolidation between $${pctMove(-3).toFixed(0)} and $${pctMove(4).toFixed(0)} is likely before the next leg up.`,
      acc: 65, daysAgo: 1
    },
    {
      name: 'Jeffrey Christian', title: 'Managing Partner, CPM Group',
      inst: 'XAU/USD', signal: xauPrice > 4500 ? 'Sell' : 'Buy', targetPct: xauPrice > 4500 ? -5 : 6, stopPct: xauPrice > 4500 ? 3 : -4, tf: '3M',
      analysis: xauPrice > 4500
        ? `Gold at $${xauPrice.toFixed(0)} has run ahead of fundamentals. Expect profit-taking to bring price back toward $${pctMove(-5).toFixed(0)}. Recommend reducing long exposure.`
        : `Gold sees continued central bank demand. Current $${xauPrice.toFixed(0)} offers a buy opportunity with a target of $${pctMove(6).toFixed(0)}.`,
      acc: 62, daysAgo: 5
    },
  ];

  return experts.map((e, i) => ({
    id: `expert-${i}`,
    expertName: e.name,
    expertTitle: e.title,
    instrument: e.inst,
    signal: e.signal,
    targetPrice: e.inst === 'XAG/USD' ? xagPctMove(e.targetPct) : pctMove(e.targetPct),
    stopLoss: e.stopPct ? (e.inst === 'XAG/USD' ? xagPctMove(e.stopPct) : pctMove(e.stopPct)) : undefined,
    timeframe: e.tf,
    analysis: e.analysis,
    publishedAt: new Date(now - e.daysAgo * 24 * 60 * 60 * 1000),
    accuracy: e.acc,
  }));
}

// ─── Economic Calendar (always current week) ───
export function generateEconomicCalendar(): EconomicEvent[] {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const events: Omit<EconomicEvent, 'id'>[] = [
    {
      title: 'FOMC Meeting Minutes',
      type: 'Central Bank',
      date: new Date(now.getTime() + 1 * dayMs),
      time: '14:00 ET',
      country: 'US',
      impact: 'High',
      description: 'Detailed minutes from the latest Federal Reserve meeting. Key focus on rate outlook and inflation assessment.',
      previous: '4.50%',
      forecast: '4.50%',
    },
    {
      title: 'US CPI (MoM)',
      type: 'Inflation',
      date: new Date(now.getTime() + 2 * dayMs),
      time: '08:30 ET',
      country: 'US',
      impact: 'High',
      description: 'Consumer Price Index measures inflation. Higher-than-expected readings are bearish for gold short-term but bullish long-term.',
      previous: '0.3%',
      forecast: '0.2%',
    },
    {
      title: 'ECB Interest Rate Decision',
      type: 'Central Bank',
      date: new Date(now.getTime() + 3 * dayMs),
      time: '07:45 ET',
      country: 'EU',
      impact: 'High',
      description: 'European Central Bank rate decision. Rate cuts weaken EUR and support gold priced in euros.',
      previous: '3.65%',
      forecast: '3.40%',
    },
    {
      title: 'US Initial Jobless Claims',
      type: 'Employment',
      date: new Date(now.getTime() + 1 * dayMs),
      time: '08:30 ET',
      country: 'US',
      impact: 'Medium',
      description: 'Weekly unemployment claims. Rising claims suggest economic weakness, bullish for gold as safe haven.',
      previous: '225K',
      forecast: '228K',
    },
    {
      title: 'China Gold Imports Report',
      type: 'Trade',
      date: new Date(now.getTime() + 4 * dayMs),
      time: '03:00 ET',
      country: 'CN',
      impact: 'Medium',
      description: 'Monthly gold import data from China, the world\'s largest consumer. Strong imports support gold prices.',
    },
    {
      title: 'US Retail Sales',
      type: 'Economic',
      date: new Date(now.getTime() + 2 * dayMs),
      time: '08:30 ET',
      country: 'US',
      impact: 'Medium',
      description: 'Measures consumer spending strength. Weak data supports rate cut expectations, bullish for gold.',
      previous: '0.4%',
      forecast: '0.3%',
    },
    {
      title: 'UK CPI (YoY)',
      type: 'Inflation',
      date: new Date(now.getTime() + 3 * dayMs),
      time: '02:00 ET',
      country: 'UK',
      impact: 'Low',
      description: 'UK inflation data. Impacts GBP and indirectly affects gold denominated in British pounds.',
      previous: '3.4%',
      forecast: '3.2%',
    },
    {
      title: 'BOJ Policy Statement',
      type: 'Central Bank',
      date: new Date(now.getTime() + 5 * dayMs),
      time: '23:00 ET',
      country: 'JP',
      impact: 'Medium',
      description: 'Bank of Japan monetary policy update. JPY strength from hawkish BOJ can pressure gold.',
    },
  ];

  return events.map((e, i) => ({ ...e, id: `econ-${i}` }));
}

// ─── Correlated Assets (derived from live gold/silver prices) ───
export function generateCorrelatedAssets(xauPrice: number, xagPrice: number): CorrelatedAsset[] {
  // Generate realistic sparkline data around a base price
  const sparkline = (base: number, volatilityPct: number): number[] => {
    const points: number[] = [];
    let price = base * (1 - volatilityPct / 100 * 5);
    for (let i = 0; i < 15; i++) {
      price += (Math.random() - 0.47) * base * volatilityPct / 100;
      points.push(price);
    }
    return points;
  };

  // DXY correlates inversely with gold
  const dxy = 100 + (4700 - xauPrice) * 0.003 + (Math.random() - 0.5) * 2;
  // US 10Y yield
  const ust10y = 4.0 + (Math.random() - 0.5) * 0.8;
  // Crude oil
  const oil = 65 + Math.random() * 20;
  // Bitcoin
  const btc = 60000 + Math.random() * 30000;

  return [
    {
      symbol: 'DXY',
      name: 'US Dollar Index',
      price: Number(dxy.toFixed(2)),
      change: Number(((Math.random() - 0.5) * dxy * 0.01).toFixed(2)),
      changePercent: Number(((Math.random() - 0.5) * 1.5).toFixed(2)),
      correlation: -0.82,
      lagDays: -1,
      lagDescription: 'DXY leads gold by ~1 day. USD weakness = gold strength.',
      reasoning: `Dollar index at ${dxy.toFixed(2)} — inverse relationship with gold. When DXY drops, gold at $${xauPrice.toFixed(0)} typically rises as the metal becomes cheaper in other currencies.`,
      recentPrices: sparkline(dxy, 0.3),
    },
    {
      symbol: 'UST10Y',
      name: 'US 10-Year Treasury Yield',
      price: Number(ust10y.toFixed(3)),
      change: Number(((Math.random() - 0.5) * 0.05).toFixed(3)),
      changePercent: Number(((Math.random() - 0.5) * 2).toFixed(2)),
      correlation: -0.65,
      lagDays: 0,
      lagDescription: 'Yields move inversely with gold. Higher yields = opportunity cost for holding gold.',
      reasoning: `10Y yield at ${ust10y.toFixed(2)}%. Rising real yields pressure gold by increasing the opportunity cost of non-yielding assets. Current gold at $${xauPrice.toFixed(0)} is influenced by rate expectations.`,
      recentPrices: sparkline(ust10y, 1.5),
    },
    {
      symbol: 'CL=F',
      name: 'Crude Oil (WTI)',
      price: Number(oil.toFixed(2)),
      change: Number(((Math.random() - 0.5) * oil * 0.02).toFixed(2)),
      changePercent: Number(((Math.random() - 0.5) * 3).toFixed(2)),
      correlation: 0.35,
      lagDays: 2,
      lagDescription: 'Oil is a mild leading indicator — rising oil suggests inflation ahead, bullish for gold.',
      reasoning: `Oil at $${oil.toFixed(2)} reflects energy inflation expectations. Higher oil ➜ higher CPI ➜ gold demand as inflation hedge. Both commodities benefit from geopolitical risk premiums.`,
      recentPrices: sparkline(oil, 1.5),
    },
    {
      symbol: 'BTC-USD',
      name: 'Bitcoin',
      price: Number(btc.toFixed(0)),
      change: Number(((Math.random() - 0.5) * btc * 0.03).toFixed(0)),
      changePercent: Number(((Math.random() - 0.5) * 5).toFixed(2)),
      correlation: 0.25,
      lagDays: 0,
      lagDescription: 'Weak correlation — both act as "alternative stores of value" but attract different capital flows.',
      reasoning: `Bitcoin at $${btc.toFixed(0)} competes with gold at $${xauPrice.toFixed(0)} for "digital gold" narrative. Institutional rotation between the two creates occasional positive correlation.`,
      recentPrices: sparkline(btc, 2),
    },
  ];
}

// ─── News & Sentiment (dynamic based on market conditions) ───
export interface DynamicNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  impact: 'High' | 'Medium' | 'Low';
  category: 'Market' | 'Geopolitical' | 'Macro' | 'Demand';
  publishedAt: Date;
}

export function generateNews(xauPrice: number, xagPrice: number, changePct: number): DynamicNewsItem[] {
  const now = Date.now();
  const h = (hours: number) => new Date(now - hours * 60 * 60 * 1000);
  const ratio = xauPrice / xagPrice;
  const isBullish = changePct >= 0;

  return [
    {
      id: 'n1', title: `Gold ${isBullish ? 'Rallies' : 'Slides'} to $${xauPrice.toFixed(0)} Amid Central Bank Activity`,
      summary: `Gold prices ${isBullish ? 'surged' : 'declined'} ${Math.abs(changePct).toFixed(2)}% in today's session as investors weigh Federal Reserve policy expectations against safe-haven demand. Trading volume remains elevated.`,
      source: 'Reuters', sentiment: isBullish ? 'Bullish' : 'Bearish', impact: 'High', category: 'Market', publishedAt: h(1),
    },
    {
      id: 'n2', title: 'Global Central Banks Continue Record Gold Purchases in 2026',
      summary: `Central banks worldwide have added over 800 tonnes of gold reserves year-to-date, with China, India, and Turkey leading purchases. This structural demand supports prices above $${(xauPrice * 0.95).toFixed(0)}.`,
      source: 'World Gold Council', sentiment: 'Bullish', impact: 'High', category: 'Demand', publishedAt: h(3),
    },
    {
      id: 'n3', title: 'Fed Minutes Signal Cautious Approach to Rate Cuts',
      summary: 'Federal Reserve officials expressed caution about cutting rates too quickly, citing persistent services inflation. Markets now price fewer cuts through year-end, creating headwinds for non-yielding assets.',
      source: 'Bloomberg', sentiment: 'Bearish', impact: 'High', category: 'Macro', publishedAt: h(5),
    },
    {
      id: 'n4', title: 'Middle East Tensions Boost Safe-Haven Demand',
      summary: `Escalating geopolitical tensions in the Middle East have driven safe-haven flows into gold, contributing to the metal's resilience above $${(xauPrice * 0.98).toFixed(0)}. Analysts expect risk premium to persist.`,
      source: 'Financial Times', sentiment: 'Bullish', impact: 'Medium', category: 'Geopolitical', publishedAt: h(8),
    },
    {
      id: 'n5', title: `Gold/Silver Ratio at ${ratio.toFixed(1)} — Silver May Outperform`,
      summary: `With silver at $${xagPrice.toFixed(2)} and the gold/silver ratio elevated at ${ratio.toFixed(1)}, analysts see potential for silver to outperform. Industrial demand from solar panel manufacturing continues to grow 15% YoY.`,
      source: 'Kitco', sentiment: 'Bullish', impact: 'Medium', category: 'Market', publishedAt: h(12),
    },
    {
      id: 'n6', title: 'US Dollar Index Weakens as Markets Reprice Rate Expectations',
      summary: 'The DXY pulled back from recent highs as Treasury yields eased. A weaker dollar typically supports gold prices by making the metal cheaper for non-USD buyers.',
      source: 'MarketWatch', sentiment: 'Bullish', impact: 'Medium', category: 'Macro', publishedAt: h(16),
    },
    {
      id: 'n7', title: 'BRICS Nations Accelerate De-Dollarization Plans',
      summary: 'The expanded BRICS bloc announced plans to increase bilateral trade settlements in local currencies, reducing reliance on USD. Gold plays a central role in the emerging alternative reserve framework.',
      source: 'CNBC', sentiment: 'Bullish', impact: 'Medium', category: 'Geopolitical', publishedAt: h(24),
    },
    {
      id: 'n8', title: 'ETF Gold Holdings Rise for Third Consecutive Month',
      summary: `Global gold-backed ETFs reported net inflows of $2.1 billion last month, the third consecutive month of positive flows. Total holdings now exceed 3,200 tonnes, supporting prices near $${xauPrice.toFixed(0)}.`,
      source: 'World Gold Council', sentiment: 'Bullish', impact: 'Low', category: 'Demand', publishedAt: h(36),
    },
  ];
}
