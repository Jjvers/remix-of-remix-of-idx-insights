import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ExpertAnalysis, GoldInstrument, Signal } from '@/types/gold';

export function useExpertAnalysis() {
  const [analyses, setAnalyses] = useState<ExpertAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = useCallback(async (goldPrice?: number, silverPrice?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('expert-analysis', {
        body: { goldPrice, silverPrice },
      });
      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error);

      const parsed: ExpertAnalysis[] = data.analyses.map((a: any) => ({
        id: a.id,
        expertName: a.expertName,
        expertTitle: a.expertTitle,
        instrument: a.instrument as GoldInstrument,
        signal: a.signal as Signal,
        targetPrice: a.targetPrice,
        stopLoss: a.stopLoss || undefined,
        timeframe: a.timeframe,
        analysis: a.analysis,
        publishedAt: new Date(a.publishedAt),
        accuracy: a.accuracy,
      }));

      setAnalyses(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch expert analyses';
      setError(message);
      console.error('Expert analysis error:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analyses, isLoading, error, fetchAnalyses };
}
