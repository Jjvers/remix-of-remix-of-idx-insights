import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GoldInstrument, OHLC } from '@/types/gold';

export type GoldChartPeriod = '3D' | '1W' | '1M' | '3M' | '6M' | '1Y';

const chartRequestMap: Record<GoldChartPeriod, {
  range: '5d' | '1mo' | '3mo' | '6mo' | '1y';
  interval: '5m' | '15m' | '60m' | '1d';
  refreshInterval: number;
}> = {
  '3D': { range: '5d', interval: '5m', refreshInterval: 15000 },
  '1W': { range: '5d', interval: '15m', refreshInterval: 15000 },
  '1M': { range: '3mo', interval: '60m', refreshInterval: 30000 },
  '3M': { range: '6mo', interval: '1d', refreshInterval: 60000 },
  '6M': { range: '1y', interval: '1d', refreshInterval: 60000 },
  '1Y': { range: '1y', interval: '1d', refreshInterval: 60000 },
};

interface MarketCandleResponse {
  success: boolean;
  candles?: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
  error?: string;
}

export function useGoldCandles(instrument: GoldInstrument, period: GoldChartPeriod) {
  const [candles, setCandles] = useState<OHLC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandles = useCallback(async () => {
    try {
      setError(null);

      const request = chartRequestMap[period];
      const { data, error: fnError } = await supabase.functions.invoke<MarketCandleResponse>('gold-prices', {
        body: {
          type: 'history',
          instrument,
          range: request.range,
          interval: request.interval,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.success || !data.candles) throw new Error(data?.error || 'Failed to fetch market candles');

      setCandles(
        data.candles.map((candle) => ({
          date: new Date(candle.timestamp * 1000),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume ?? 0,
        })),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch market candles';
      setError(message);
      console.error('Gold candle fetch error:', message);
    } finally {
      setIsLoading(false);
    }
  }, [instrument, period]);

  useEffect(() => {
    setIsLoading(true);
    fetchCandles();

    const poller = setInterval(fetchCandles, chartRequestMap[period].refreshInterval);
    return () => clearInterval(poller);
  }, [fetchCandles, period]);

  return { candles, isLoading, error, refetch: fetchCandles };
}