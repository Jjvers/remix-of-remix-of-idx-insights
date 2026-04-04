import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EconomicEvent, EventImpact } from '@/types/gold';

export function useEconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('economic-calendar');
      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error);

      const parsed: EconomicEvent[] = data.events.map((e: any) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        date: new Date(e.date),
        time: e.time,
        country: e.country,
        impact: e.impact as EventImpact,
        description: e.description,
        previous: e.previous || undefined,
        forecast: e.forecast || undefined,
        actual: e.actual || undefined,
      }));

      setEvents(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch calendar';
      setError(message);
      console.error('Economic calendar error:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { events, isLoading, error, fetchEvents };
}
