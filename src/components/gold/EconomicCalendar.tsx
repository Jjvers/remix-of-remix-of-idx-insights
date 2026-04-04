import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEconomicCalendar } from '@/hooks/useEconomicCalendar';
import { economicEvents as mockEvents } from '@/data/mockGoldData';
import type { EconomicEvent, EventImpact } from '@/types/gold';
import { format, isToday, isTomorrow } from 'date-fns';
import { Calendar, AlertCircle, Loader2, RefreshCw, Zap } from 'lucide-react';

const impactStyles: Record<EventImpact, string> = {
  'High': 'bg-loss text-loss-foreground',
  'Medium': 'bg-yellow-500 text-black',
  'Low': 'bg-muted text-muted-foreground'
};

const impactDots: Record<EventImpact, string> = {
  'High': 'bg-loss',
  'Medium': 'bg-yellow-500',
  'Low': 'bg-muted-foreground'
};

function EventCard({ event }: { event: EconomicEvent }) {
  const dateLabel = isToday(event.date) 
    ? 'Today' 
    : isTomorrow(event.date) 
      ? 'Tomorrow' 
      : format(event.date, 'MMM dd');

  return (
    <div className="p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge className={impactStyles[event.impact]} variant="secondary">
            {event.impact}
          </Badge>
          <Badge variant="outline">{event.country}</Badge>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{dateLabel}</p>
          <p className="text-xs text-muted-foreground">{event.time}</p>
        </div>
      </div>
      
      <h4 className="font-semibold text-foreground mb-1">{event.title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
      
      {(event.previous || event.forecast) && (
        <div className="flex gap-4 pt-2 border-t border-border">
          {event.previous && (
            <div>
              <p className="text-xs text-muted-foreground">Previous</p>
              <p className="font-mono text-sm">{event.previous}</p>
            </div>
          )}
          {event.forecast && (
            <div>
              <p className="text-xs text-muted-foreground">Forecast</p>
              <p className="font-mono text-sm text-accent">{event.forecast}</p>
            </div>
          )}
          {event.actual && (
            <div>
              <p className="text-xs text-muted-foreground">Actual</p>
              <p className="font-mono text-sm font-bold">{event.actual}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EconomicCalendar() {
  const [filter, setFilter] = useState<'all' | 'high'>('all');
  const { events: liveEvents, isLoading, fetchEvents } = useEconomicCalendar();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const events = liveEvents.length > 0 ? liveEvents : mockEvents;
  const hasLive = liveEvents.length > 0;

  const filteredEvents = events
    .filter(e => filter === 'all' || e.impact === 'High')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingHigh = events.filter(e => 
    e.impact === 'High' && e.date >= new Date()
  ).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Economic Calendar
            {hasLive && (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px]">
                Live
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => fetchEvents()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : hasLive ? (
                <RefreshCw className="h-3 w-3" />
              ) : (
                <Zap className="h-3 w-3" />
              )}
              {hasLive ? 'Refresh' : 'Get Live'}
            </Button>
            {upcomingHigh > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {upcomingHigh} High Impact
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Events
          </Button>
          <Button 
            variant={filter === 'high' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('high')}
          >
            High Impact Only
          </Button>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {isLoading && liveEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
              <p className="text-sm text-muted-foreground">Loading economic events...</p>
            </div>
          ) : (
            filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">Impact:</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${impactDots['High']}`} />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${impactDots['Medium']}`} />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${impactDots['Low']}`} />
              <span>Low</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
