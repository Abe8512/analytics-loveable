
import { supabase } from "@/integrations/supabase/client";
import { EventsStore } from "./events";
import { useState, useEffect } from "react";
import { Subject, of } from "rxjs";
import { debounceTime, throttleTime } from "rxjs/operators";
import { 
  MetricUpdate, MetricUpdateType, MetricValue, 
  TeamMetric, RepMetric, TalkRatio, SpeakerActivity, KeyPhrase 
} from "./RealTimeMetrics.types";

// Create metric update stream
const metricUpdates$ = new Subject<MetricUpdate>();

// Debounce metrics to avoid excessive updates
const debouncedMetrics$ = metricUpdates$.pipe(
  debounceTime(300)
);

// Setup mock team metrics data
const mockTeamMetrics: TeamMetric[] = [
  { 
    team_name: "Sales Team A", 
    team_id: "team-1", 
    call_count: 127, 
    avg_sentiment: 0.78, 
    conversion_rate: 0.32 
  },
  { 
    team_name: "Sales Team B", 
    team_id: "team-2", 
    call_count: 95, 
    avg_sentiment: 0.64, 
    conversion_rate: 0.27 
  },
  { 
    team_name: "Enterprise", 
    team_id: "team-3", 
    call_count: 52, 
    avg_sentiment: 0.82, 
    conversion_rate: 0.41 
  },
];

// Setup mock rep metrics data
const mockRepMetrics: RepMetric[] = [
  { 
    rep_name: "John Smith", 
    rep_id: "rep-1", 
    call_count: 42, 
    avg_sentiment: 0.75, 
    conversion_rate: 0.3 
  },
  { 
    rep_name: "Sarah Johnson", 
    rep_id: "rep-2", 
    call_count: 38, 
    avg_sentiment: 0.82, 
    conversion_rate: 0.35 
  },
  { 
    rep_name: "Michael Brown", 
    rep_id: "rep-3", 
    call_count: 31, 
    avg_sentiment: 0.68, 
    conversion_rate: 0.28 
  },
  { 
    rep_name: "Emily Davis", 
    rep_id: "rep-4", 
    call_count: 27, 
    avg_sentiment: 0.71, 
    conversion_rate: 0.32 
  }
];

// Publish a metric update
export const publishMetricUpdate = (type: MetricUpdateType, value: any) => {
  metricUpdates$.next({
    type,
    value,
    timestamp: Date.now()
  });
};

// Set up the talk ratio
export const setTalkRatio = (agentRatio: number, clientRatio: number) => {
  publishMetricUpdate('talk_ratio', { agent: agentRatio, client: clientRatio });
};

// Set the sentiment value
export const setSentiment = (value: number) => {
  publishMetricUpdate('sentiment', value);
};

// Add a key phrase
export const addKeyPhrase = (phrase: string, sentiment?: number) => {
  publishMetricUpdate('key_phrase', { text: phrase, sentiment, timestamp: Date.now() });
};

// Set speaker activity
export const setSpeakerActivity = (agent: boolean, customer: boolean) => {
  publishMetricUpdate('speaker_active', { agent, customer });
};

// Hook for team metrics
export const useTeamMetrics = () => {
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeamMetrics = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, fetch from Supabase
        // For now, we'll use mock data
        setMetrics(mockTeamMetrics);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch team metrics'));
        setIsLoading(false);
      }
    };

    fetchTeamMetrics();
  }, []);

  return { metrics, isLoading, error };
};

// Hook for rep metrics
export const useRepMetrics = () => {
  const [metrics, setMetrics] = useState<RepMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRepMetrics = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, fetch from Supabase
        // For now, we'll use mock data
        setMetrics(mockRepMetrics);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch rep metrics'));
        setIsLoading(false);
      }
    };

    fetchRepMetrics();
  }, []);

  return { metrics, isLoading, error };
};

// Hook to subscribe to real-time metrics
export const useRealtimeMetrics = () => {
  const [talkRatio, setTalkRatio] = useState<TalkRatio>({ agent: 50, client: 50 });
  const [sentiment, setSentiment] = useState<MetricValue>({ value: 0.5 });
  const [duration, setDuration] = useState<number>(0);
  const [keyPhrases, setKeyPhrases] = useState<KeyPhrase[]>([]);
  const [speakerActivity, setSpeakerActivity] = useState<SpeakerActivity>({ agent: false, customer: false });

  useEffect(() => {
    const subscription = debouncedMetrics$.subscribe(update => {
      switch (update.type) {
        case 'talk_ratio':
          setTalkRatio(update.value);
          break;
        case 'sentiment':
          setSentiment(prev => ({
            value: update.value,
            previous: prev.value,
            change: update.value - prev.value,
            trend: update.value > prev.value ? 'up' : update.value < prev.value ? 'down' : 'neutral'
          }));
          break;
        case 'duration':
          setDuration(update.value);
          break;
        case 'key_phrase':
          setKeyPhrases(prev => [...prev, update.value]);
          break;
        case 'speaker_active':
          setSpeakerActivity(update.value);
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { talkRatio, sentiment, duration, keyPhrases, speakerActivity };
};
