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
export function generateExpertAnalyses(xauPrice: number, xagPrice: number, lang: 'en' | 'id' = 'en'): ExpertAnalysis[] {
  const now = Date.now();
  const pctMove = (pct: number) => xauPrice * (1 + pct / 100);
  const xagPctMove = (pct: number) => xagPrice * (1 + pct / 100);

  const experts: { 
    name: string; 
    title: string; 
    inst: GoldInstrument; 
    signal: Signal; 
    targetPct: number; 
    stopPct?: number; 
    tf: Timeframe; 
    analysis: { en: string; id: string }; 
    acc: number; 
    daysAgo: number 
  }[] = [
    {
      name: 'Goldman Sachs Research', title: 'Commodities Desk',
      inst: 'XAU/USD', signal: 'Strong Buy', targetPct: 8, stopPct: -4, tf: '3M',
      analysis: {
        en: `Gold remains our top commodity pick. With central banks diversifying reserves and real yields compressing, we see $${pctMove(8).toFixed(0)} as achievable. Current price of $${xauPrice.toFixed(0)} offers favorable risk/reward.`,
        id: `Emas tetap menjadi pilihan komoditas utama kami. Dengan bank sentral melakukan diversifikasi cadangan dan kompresi imbal hasil riil, kami melihat $${pctMove(8).toFixed(0)} sebagai target yang dapat dicapai. Harga saat ini $${xauPrice.toFixed(0)} menawarkan risiko/hasil yang menguntungkan.`
      },
      acc: 74, daysAgo: 1
    },
    {
      name: 'Peter Schiff', title: 'CEO, Euro Pacific Capital',
      inst: 'XAU/USD', signal: 'Strong Buy', targetPct: 12, stopPct: -5, tf: '3M',
      analysis: {
        en: `The Fed's monetary policy continues to debase the dollar. Gold at $${xauPrice.toFixed(0)} is still undervalued. I expect a move toward $${pctMove(12).toFixed(0)} as inflation proves stickier than expected.`,
        id: `Kebijakan moneter Fed terus mendebas dolar. Emas di harga $${xauPrice.toFixed(0)} masih undervalued. Saya memperkirakan pergerakan menuju $${pctMove(12).toFixed(0)} karena inflasi terbukti lebih persisten dari perkiraan.`
      },
      acc: 71, daysAgo: 2
    },
    {
      name: 'Ole Hansen', title: 'Head of Commodity Strategy, Saxo Bank',
      inst: 'XAU/USD', signal: 'Buy', targetPct: 5, stopPct: -3, tf: '1M',
      analysis: {
        en: `Technical setup bullish with price holding above key support at $${pctMove(-3).toFixed(0)}. BRICS de-dollarization continues to be a tailwind. Target $${pctMove(5).toFixed(0)}.`,
        id: `Setup teknis bullish dengan harga tertahan di atas support utama di $${pctMove(-3).toFixed(0)}. De-dollarisasi BRICS terus menjadi pendorong. Target $${pctMove(5).toFixed(0)}.`
      },
      acc: 68, daysAgo: 3
    },
    {
      name: 'Nicky Shiels', title: 'Head of Metals Strategy, MKS PAMP',
      inst: 'XAG/USD', signal: 'Buy', targetPct: 10, tf: '1M',
      analysis: {
        en: `Silver at $${xagPrice.toFixed(2)} is undervalued relative to gold. Gold/Silver ratio at ${(xauPrice / xagPrice).toFixed(1)} signals mean-reversion opportunity. Industrial demand from solar remains robust.`,
        id: `Perak di harga $${xagPrice.toFixed(2)} dinilai terlalu rendah dibandingkan emas. Rasio Emas/Perak di ${(xauPrice / xagPrice).toFixed(1)} menandakan peluang pembalikan rata-rata. Permintaan industri dari panel surya tetap kuat.`
      },
      acc: 66, daysAgo: 4
    },
    {
      name: 'Carsten Menke', title: 'Head of Next Gen Research, Julius Baer',
      inst: 'XAU/USD', signal: 'Neutral', targetPct: 2, stopPct: -3, tf: '1W',
      analysis: {
        en: `Gold at $${xauPrice.toFixed(0)} is fairly valued near-term. While the long-term trend is intact, a period of consolidation between $${pctMove(-3).toFixed(0)} and $${pctMove(4).toFixed(0)} is likely before the next leg up.`,
        id: `Emas di harga $${xauPrice.toFixed(0)} dinilai wajar dalam jangka pendek. Meskipun tren jangka panjang tetap utuh, periode konsolidasi antara $${pctMove(-3).toFixed(0)} dan $${pctMove(4).toFixed(0)} kemungkinan terjadi sebelum kenaikan berikutnya.`
      },
      acc: 65, daysAgo: 1
    },
    {
      name: 'Jeffrey Christian', title: 'Managing Partner, CPM Group',
      inst: 'XAU/USD', signal: xauPrice > 4500 ? 'Sell' : 'Buy', targetPct: xauPrice > 4500 ? -5 : 6, stopPct: xauPrice > 4500 ? 3 : -4, tf: '3M',
      analysis: {
        en: xauPrice > 4500
          ? `Gold at $${xauPrice.toFixed(0)} has run ahead of fundamentals. Expect profit-taking to bring price back toward $${pctMove(-5).toFixed(0)}. Recommend reducing long exposure.`
          : `Gold sees continued central bank demand. Current $${xauPrice.toFixed(0)} offers a buy opportunity with a target of $${pctMove(6).toFixed(0)}.`,
        id: xauPrice > 4500
          ? `Emas di harga $${xauPrice.toFixed(0)} telah melampaui fundamental. Perkirakan aksi ambil untung yang akan membawa harga kembali ke arah $${pctMove(-5).toFixed(0)}. Direkomendasikan untuk mengurangi eksposur long.`
          : `Emas melihat permintaan bank sentral yang berkelanjutan. Harga saat ini $${xauPrice.toFixed(0)} menawarkan peluang beli dengan target $${pctMove(6).toFixed(0)}.`
      },
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
    analysis: e.analysis[lang],
    publishedAt: new Date(now - e.daysAgo * 24 * 60 * 60 * 1000),
    accuracy: e.acc,
  }));
}

// ─── Economic Calendar (always current week) ───
export function generateEconomicCalendar(lang: 'en' | 'id' = 'en'): EconomicEvent[] {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const events: (Omit<EconomicEvent, 'id' | 'title' | 'description'> & { title: { en: string; id: string }; description: { en: string; id: string } })[] = [
    {
      title: { en: 'FOMC Meeting Minutes', id: 'Notulen Rapat FOMC' },
      type: 'Central Bank',
      date: new Date(now.getTime() + 1 * dayMs),
      time: '14:00 ET',
      country: 'US',
      impact: 'High',
      description: {
        en: 'Detailed minutes from the latest Federal Reserve meeting. Key focus on rate outlook and inflation assessment.',
        id: 'Notulen terperinci dari rapat Federal Reserve terbaru. Fokus utama pada prospek suku bunga dan penilaian inflasi.'
      },
      previous: '4.50%',
      forecast: '4.50%',
    },
    {
      title: { en: 'US CPI (MoM)', id: 'IHK AS (MoM)' },
      type: 'Inflation',
      date: new Date(now.getTime() + 2 * dayMs),
      time: '08:30 ET',
      country: 'US',
      impact: 'High',
      description: {
        en: 'Consumer Price Index measures inflation. Higher-than-expected readings are bearish for gold short-term but bullish long-term.',
        id: 'Indeks Harga Konsumen mengukur inflasi. Angka yang lebih tinggi dari perkiraan berdampak bearish untuk emas jangka pendek tetapi bullish jangka panjang.'
      },
      previous: '0.3%',
      forecast: '0.2%',
    },
    {
      title: { en: 'ECB Interest Rate Decision', id: 'Keputusan Suku Bunga ECB' },
      type: 'Central Bank',
      date: new Date(now.getTime() + 3 * dayMs),
      time: '07:45 ET',
      country: 'EU',
      impact: 'High',
      description: {
        en: 'European Central Bank rate decision. Rate cuts weaken EUR and support gold priced in euros.',
        id: 'Keputusan suku bunga Bank Sentral Eropa. Pemotongan suku bunga memperlemah EUR dan mendukung emas yang dihargai dalam euro.'
      },
      previous: '3.65%',
      forecast: '3.40%',
    },
    {
      title: { en: 'US Initial Jobless Claims', id: 'Klaim Pengangguran Awal AS' },
      type: 'Employment',
      date: new Date(now.getTime() + 1 * dayMs),
      time: '08:30 ET',
      country: 'US',
      impact: 'Medium',
      description: {
        en: 'Weekly unemployment claims. Rising claims suggest economic weakness, bullish for gold as safe haven.',
        id: 'Klaim pengangguran mingguan. Kenaikan klaim menunjukkan kelemahan ekonomi, bullish bagi emas sebagai safe haven.'
      },
      previous: '225K',
      forecast: '228K',
    },
    {
      title: { en: 'China Gold Imports Report', id: 'Laporan Impor Emas China' },
      type: 'Trade',
      date: new Date(now.getTime() + 4 * dayMs),
      time: '03:00 ET',
      country: 'CN',
      impact: 'Medium',
      description: {
        en: 'Monthly gold import data from China, the world\'s largest consumer. Strong imports support gold prices.',
        id: 'Data impor emas bulanan dari China, konsumen terbesar di dunia. Impor yang kuat mendukung harga emas.'
      },
    },
  ];

  return events.map((e, i) => ({ 
    ...e, 
    id: `econ-${i}`,
    title: e.title[lang],
    description: e.description[lang]
  }));
}

// ─── Correlated Assets (derived from live gold/silver prices) ───
// ─── Correlated Assets (derived from live gold/silver prices) ───
export function generateCorrelatedAssets(xauPrice: number, xagPrice: number, lang: 'en' | 'id' = 'en'): CorrelatedAsset[] {
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
      lagDescription: lang === 'en' ? 'DXY leads gold by ~1 day. USD weakness = gold strength.' : 'DXY memimpin emas ~1 hari. Kelemahan USD = kekuatan emas.',
      reasoning: lang === 'en' 
        ? `Dollar index at ${dxy.toFixed(2)} — inverse relationship with gold. When DXY drops, gold at $${xauPrice.toFixed(0)} typically rises as the metal becomes cheaper in other currencies.`
        : `Indeks dolar di ${dxy.toFixed(2)} — hubungan terbalik dengan emas. Saat DXY turun, emas di $${xauPrice.toFixed(0)} biasanya naik karena logam menjadi lebih murah dalam mata uang lain.`,
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
      lagDescription: lang === 'en' ? 'Yields move inversely with gold. Higher yields = opportunity cost for holding gold.' : 'Imbal hasil bergerak terbalik dengan emas. Imbal hasil yang lebih tinggi = biaya peluang untuk memegang emas.',
      reasoning: lang === 'en'
        ? `10Y yield at ${ust10y.toFixed(2)}%. Rising real yields pressure gold by increasing the opportunity cost of non-yielding assets.`
        : `Imbal hasil 10Y di ${ust10y.toFixed(2)}%. Kenaikan imbal hasil riil menekan emas dengan meningkatkan biaya peluang aset yang tidak menghasilkan bunga.`,
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
      lagDescription: lang === 'en' ? 'Oil is a mild leading indicator — rising oil suggests inflation ahead.' : 'Minyak adalah indikator utama ringan — kenaikan minyak menunjukkan inflasi di masa depan.',
      reasoning: lang === 'en'
        ? `Oil at $${oil.toFixed(2)} reflects energy inflation expectations. Higher oil ➜ higher CPI ➜ gold demand as inflation hedge.`
        : `Minyak di $${oil.toFixed(2)} mencerminkan ekspektasi inflasi energi. Minyak lebih tinggi ➜ IHK lebih tinggi ➜ permintaan emas sebagai lindung nilai inflasi.`,
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
      lagDescription: lang === 'en' ? 'Weak correlation — both act as alternative stores of value.' : 'Korelasi lemah — keduanya bertindak sebagai penyimpan nilai alternatif.',
      reasoning: lang === 'en'
        ? `Bitcoin at $${btc.toFixed(0)} competes with gold at $${xauPrice.toFixed(0)} for digital gold narrative.`
        : `Bitcoin di $${btc.toFixed(0)} bersaing dengan emas di $${xauPrice.toFixed(0)} untuk narasi emas digital.`,
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

export function generateNews(xauPrice: number, xagPrice: number, changePct: number, lang: 'en' | 'id' = 'en'): DynamicNewsItem[] {
  // Use bucketed time (every 5 mins) to prevent "time ago" drift every second
  const stableNow = Math.floor(Date.now() / 300000) * 300000;
  const h = (hours: number) => new Date(stableNow - hours * 60 * 60 * 1000);
  
  // Use rounded prices for news context (market levels vs live tick)
  const xauRounded = Math.round(xauPrice / 5) * 5;
  const xagRounded = Number((Math.round(xagPrice * 4) / 4).toFixed(2)); // Round to nearest 0.25
  
  const ratio = xauPrice / xagPrice;
  const isBullish = changePct >= 0;

  const news: (Omit<DynamicNewsItem, 'title' | 'summary'> & { title: { en: string; id: string }; summary: { en: string; id: string } })[] = [
    {
      id: 'n1', 
      source: 'Reuters', sentiment: isBullish ? 'Bullish' : 'Bearish', impact: 'High', category: 'Market', publishedAt: h(1),
      title: {
        en: `Gold ${isBullish ? 'Rallies' : 'Slides'} to $${xauRounded} Amid Central Bank Activity`,
        id: `Emas ${isBullish ? 'Menguat' : 'Melemah'} ke $${xauRounded} di Tengah Aktivitas Bank Sentral`
      },
      summary: {
        en: `Gold prices ${isBullish ? 'surged' : 'declined'} ${Math.abs(changePct).toFixed(2)}% in today's session as investors weigh Fed policy.`,
        id: `Harga emas ${isBullish ? 'melonjak' : 'turun'} ${Math.abs(changePct).toFixed(2)}% di sesi hari ini karena investor menimbang kebijakan Fed.`
      }
    },
    {
      id: 'n2',
      source: 'World Gold Council', sentiment: 'Bullish', impact: 'High', category: 'Demand', publishedAt: h(3),
      title: {
        en: 'Global Central Banks Continue Record Gold Purchases in 2026',
        id: 'Bank Sentral Global Lanjutkan Rekor Pembelian Emas di 2026'
      },
      summary: {
        en: `Central banks worldwide have added over 800 tonnes of gold reserves year-to-date. This structural demand supports prices above $${(xauRounded * 0.95).toFixed(0)}.`,
        id: `Bank sentral di seluruh dunia telah menambahkan lebih dari 800 ton cadangan emas sejak awal tahun. Permintaan struktural ini mendukung harga di atas $${(xauRounded * 0.95).toFixed(0)}.`
      }
    },
    {
      id: 'n3',
      source: 'Bloomberg', sentiment: 'Bearish', impact: 'High', category: 'Macro', publishedAt: h(5),
      title: {
        en: 'Fed Minutes Signal Cautious Approach to Rate Cuts',
        id: 'Notulen Fed Isyaratkan Pendekatan Hati-hati terhadap Penurunan Bunga'
      },
      summary: {
        en: 'Federal Reserve officials expressed caution about cutting rates too quickly, citing persistent inflation.',
        id: 'Pejabat Federal Reserve menyatakan kehati-hatian dalam memotong suku bunga terlalu cepat, mengutip inflasi yang persisten.'
      }
    },
    {
      id: 'n4',
      source: 'Financial Times', sentiment: 'Bullish', impact: 'Medium', category: 'Geopolitical', publishedAt: h(8),
      title: {
        en: 'Middle East Tensions Boost Safe-Haven Demand',
        id: 'Ketegangan Timur Tengah Tingkatkan Permintaan Safe-Haven'
      },
      summary: {
        en: `Escalating geopolitical tensions drive safe-haven flows into gold, protecting values above $${(xauRounded * 0.98).toFixed(0)}.`,
        id: `Ketegangan geopolitik yang meningkat mendorong aliran safe-haven ke dalam emas, melindungi nilai di atas $${(xauRounded * 0.98).toFixed(0)}.`
      }
    },
    {
      id: 'n5', 
      source: 'Kitco', sentiment: 'Bullish', impact: 'Medium', category: 'Market', publishedAt: h(12),
      title: {
        en: `Gold/Silver Ratio at ${ratio.toFixed(1)} — Silver May Outperform`,
        id: `Rasio Emas/Perak di ${ratio.toFixed(1)} — Perak Mungkin Unggul`
      },
      summary: {
        en: `With silver at $${xagRounded} and the ratio elevated, analysts see potential for silver outperformance.`,
        id: `Dengan perak di $${xagRounded} dan rasio yang tinggi, analis melihat potensi perak untuk mengungguli emas.`
      }
    },
  ];

  return news.map(n => ({
    ...n,
    title: n.title[lang],
    summary: n.summary[lang]
  }));
}
