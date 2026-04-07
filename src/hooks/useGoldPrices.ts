import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { OHLC } from '@/types/gold';

export interface LiveGoldPrices {
  XAU: number;
  XAG: number;
  goldSilverRatio: number;
  XAU_open: number;
  XAU_high: number;
  XAU_low: number;
  XAU_prev_close: number;
  XAU_change: number;
  XAU_changePercent: number;
  XAG_open: number;
  XAG_high: number;
  XAG_low: number;
  XAG_prev_close: number;
  XAG_change: number;
  XAG_changePercent: number;
  // Correlated Assets
  dxy: { price: number; changePercent: number; history: number[] };
  btc: { price: number; changePercent: number; history: number[] };
  oil: { price: number; changePercent: number; history: number[] };
  yield10y: { price: number; changePercent: number; history: number[] };
  vix: { price: number; changePercent: number; history: number[] };
  timestamp: number;
  date: string;
  history: {
    XAU: OHLC[];
    XAG: OHLC[];
  };
}

// --- Source 1: Stooq — near real-time SPOT price, no API key, fast refresh ---
// CSV format: Symbol,Date,Time,Open,High,Low,Close,Volume
async function fetchSpotPrice(metal: 'XAU' | 'XAG') {
  const symbol = metal === 'XAU' ? 'xauusd' : 'xagusd';
  const res = await fetch(`/api/stooq/q/l/?s=${symbol}&f=sd2t2ohlcv&h&e=csv`);
  if (!res.ok) throw new Error(`Stooq fetch failed for ${metal}: ${res.status}`);

  const text = await res.text();
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error(`Stooq returned no data for ${metal}`);

  // lines[0] = header, lines[1] = data
  const vals = lines[1].split(',');
  // Symbol,Date,Time,Open,High,Low,Close,Volume
  const open = parseFloat(vals[3]);
  const high = parseFloat(vals[4]);
  const low = parseFloat(vals[5]);
  const price = parseFloat(vals[6]); // Close = current price

  // Previous close: use open as proxy (open = previous session close approx)
  const prevClose = open;
  const change = price - prevClose;
  const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

  return { price, prevClose, open, high, low, change, changePercent };
}

// --- Source 2: Yahoo Finance via Vite proxy — historical OHLC shape only ---
async function fetchYahooHistory(symbol: string): Promise<OHLC[]> {
  const res = await fetch(`/api/yahoo/v8/finance/chart/${symbol}?interval=1d&range=1y`);
  if (!res.ok) throw new Error(`Yahoo history failed for ${symbol}: ${res.status}`);

  const body = await res.json();
  const result = body.chart.result[0];
  const quote = result.indicators.quote[0];

  return result.timestamp
    .map((ts: number, i: number) => ({
      date: new Date(ts * 1000),
      open: quote.open[i] || 0,
      high: quote.high[i] || 0,
      low: quote.low[i] || 0,
      close: quote.close[i] || 0,
      volume: quote.volume[i] || 0,
    }))
    .filter((c: OHLC) => (c.close as number) > 0);
}

// --- Source 3: Generic Asset Fetcher (Yahoo) ---
async function fetchYahooAsset(symbol: string) {
  const res = await fetch(`/api/yahoo/v8/finance/chart/${symbol}?interval=1d&range=1mo`);
  if (!res.ok) throw new Error(`Yahoo fetch failed for ${symbol}: ${res.status}`);

  const body = await res.json();
  const result = body.chart.result[0];
  const meta = result.meta;
  const quote = result.indicators.quote[0].close || [];

  const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
  const prevClose = meta.previousClose || meta.chartPreviousClose || price;
  
  // Calculate change percent safely
  let changePercent = 0;
  if (prevClose !== 0) {
    changePercent = ((price - prevClose) / prevClose) * 100;
  }

  // Last 15 days of closing prices (or whatever is available) for sparkline
  const history = quote.filter((v: any) => v != null).slice(-15);

  return { 
    price: price || (history.length > 0 ? history[history.length - 1] : 0), 
    changePercent: isNaN(changePercent) ? 0 : changePercent, 
    history 
  };
}

// Scale history candles so the last close aligns with real spot price
function scaleHistory(history: OHLC[], spotPrice: number): OHLC[] {
  if (history.length === 0 || spotPrice === 0) return history;
  const lastClose = history[history.length - 1].close as number;
  if (lastClose === 0) return history;
  const scale = spotPrice / lastClose;
  return history.map(c => ({
    date: c.date,
    open: (c.open as number) * scale,
    high: (c.high as number) * scale,
    low: (c.low as number) * scale,
    close: (c.close as number) * scale,
    volume: c.volume,
  }));
}

export function useGoldPrices(refreshInterval = 10000) {
  const [prices, setPrices] = useState<LiveGoldPrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);

      const [xauSpot, xagSpot, xauHistory, xagHistory, dxyData, btcData, oilData, yieldData, vixData] = await Promise.all([
        fetchSpotPrice('XAU'),
        fetchSpotPrice('XAG'),
        fetchYahooHistory('GC=F'),
        fetchYahooHistory('SI=F'),
        fetchYahooAsset('DX-Y.NYB'),
        fetchYahooAsset('BTC-USD'),
        fetchYahooAsset('CL=F'),
        fetchYahooAsset('^TNX'),
        fetchYahooAsset('^VIX'),
      ]);

      const now = Math.floor(Date.now() / 1000);
      const todayStr = new Date().toISOString().split('T')[0];

      setPrices({
        XAU: xauSpot.price,
        XAG: xagSpot.price,
        goldSilverRatio: xauSpot.price / xagSpot.price,
        XAU_open: xauSpot.open,
        XAU_high: xauSpot.high,
        XAU_low: xauSpot.low,
        XAU_prev_close: xauSpot.prevClose,
        XAU_change: xauSpot.change,
        XAU_changePercent: xauSpot.changePercent,
        XAG_open: xagSpot.open,
        XAG_high: xagSpot.high,
        XAG_low: xagSpot.low,
        XAG_prev_close: xagSpot.prevClose,
        XAG_change: xagSpot.change,
        XAG_changePercent: xagSpot.changePercent,
        // Live Correlated Assets
        dxy: dxyData,
        btc: btcData,
        oil: oilData,
        yield10y: yieldData,
        vix: vixData,
        timestamp: now,
        date: todayStr,
        history: {
          XAU: scaleHistory(xauHistory, xauSpot.price),
          XAG: scaleHistory(xagHistory, xagSpot.price),
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch gold prices';
      setError(message);
      console.error('Gold price fetch error:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Live tick: simulate micro-fluctuation every second between API refreshes
  useEffect(() => {
    if (!prices) return;
    const tickInterval = setInterval(() => {
      setPrices(prev => {
        if (!prev) return prev;
        const xauDelta = (Math.random() - 0.48) * prev.XAU * 0.00008;
        const xagDelta = (Math.random() - 0.48) * prev.XAG * 0.00015;
        const btcDelta = (Math.random() - 0.48) * prev.btc.price * 0.0001;
        const dxyDelta = (Math.random() - 0.48) * prev.dxy.price * 0.00005;

        const newXAU = prev.XAU + xauDelta;
        const newXAG = prev.XAG + xagDelta;

        return {
          ...prev,
          XAU: newXAU,
          XAG: newXAG,
          goldSilverRatio: newXAU / newXAG,
          XAU_high: Math.max(prev.XAU_high, newXAU),
          XAU_low: Math.min(prev.XAU_low, newXAU),
          XAG_high: Math.max(prev.XAG_high, newXAG),
          XAG_low: Math.min(prev.XAG_low, newXAG),
          XAU_change: newXAU - prev.XAU_prev_close,
          XAU_changePercent: ((newXAU - prev.XAU_prev_close) / prev.XAU_prev_close) * 100,
          XAG_change: newXAG - prev.XAG_prev_close,
          XAG_changePercent: ((newXAG - prev.XAG_prev_close) / prev.XAG_prev_close) * 100,
          btc: { ...prev.btc, price: prev.btc.price + btcDelta },
          dxy: { ...prev.dxy, price: prev.dxy.price + dxyDelta },
        };
      });
    }, 1000);
    return () => clearInterval(tickInterval);
  }, [!!prices]);

  // Periodic re-fetch from API for accuracy
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval]);

  return { prices, isLoading, error, refetch: fetchPrices };
}
