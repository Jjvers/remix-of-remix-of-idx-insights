import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LiveGoldPrices {
  XAU: number;
  XAG: number;
  goldSilverRatio: number;
  // Real OHLC from GoldAPI
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
  timestamp: number;
  date: string;
}

export function useGoldPrices(refreshInterval = 60000) {
  const [prices, setPrices] = useState<LiveGoldPrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fnError } = await supabase.functions.invoke('gold-prices', {
        body: { type: 'latest' },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error);

      setPrices({
        XAU: data.prices.XAU,
        XAG: data.prices.XAG,
        goldSilverRatio: data.prices.goldSilverRatio,
        XAU_open: data.prices.XAU_open,
        XAU_high: data.prices.XAU_high,
        XAU_low: data.prices.XAU_low,
        XAU_prev_close: data.prices.XAU_prev_close,
        XAU_change: data.prices.XAU_change,
        XAU_changePercent: data.prices.XAU_changePercent,
        XAG_open: data.prices.XAG_open,
        XAG_high: data.prices.XAG_high,
        XAG_low: data.prices.XAG_low,
        XAG_prev_close: data.prices.XAG_prev_close,
        XAG_change: data.prices.XAG_change,
        XAG_changePercent: data.prices.XAG_changePercent,
        timestamp: data.timestamp,
        date: data.date,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch gold prices';
      setError(message);
      console.error('Gold price fetch error:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Simulate per-second price tick between API fetches
  useEffect(() => {
    if (!prices) return;
    const tickInterval = setInterval(() => {
      setPrices(prev => {
        if (!prev) return prev;
        // Small random fluctuation to simulate real-time tick
        const xauVol = prev.XAU * 0.00008; // ~0.008% per tick
        const xagVol = prev.XAG * 0.00015;
        const xauChange = (Math.random() - 0.48) * xauVol;
        const xagChange = (Math.random() - 0.48) * xagVol;
        const newXAU = prev.XAU + xauChange;
        const newXAG = prev.XAG + xagChange;
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
        };
      });
    }, 1000);
    return () => clearInterval(tickInterval);
  }, [!!prices]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval]);

  return { prices, isLoading, error, refetch: fetchPrices };
}
