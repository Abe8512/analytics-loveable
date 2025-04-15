import { useState, useEffect } from 'react';
import { TeamPerformanceMetric, TeamPerformance } from '@/types/teamTypes';
import { EventsService } from './EventsService';

export interface TeamMetrics {
  callVolume: number;
  avgCallDuration: number;
  avgSentimentScore: number;
  avgConversionRate: number;
  topPerformers: TeamPerformanceMetric[];
  trending: {
    callVolume: {
      value: number;
      change: number;
      trend: 'up' | 'down' | 'neutral';
    };
    conversions: {
      value: number;
      change: number;
      trend: 'up' | 'down' | 'neutral';
    };
    avgDuration: {
      value: number;
      change: number;
      trend: 'up' | 'down' | 'neutral';
    };
  };
}

export interface RepMetrics {
  id: string;
  name: string;
  callVolume: number;
  avgDuration: number;
  sentimentScore: number;
  successRate: number;
  objectionHandlingScore: number;
  positiveLanguageScore: number;
  talkRatio: number;
  recentCalls: {
    id: string;
    date: string;
    customer: string;
    duration: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    outcome: string;
  }[];
  topKeywords: string[];
}

// Mock data generators for demos
const generateMockTeamMetrics = (): TeamMetrics => {
  return {
    callVolume: Math.floor(Math.random() * 1000) + 500,
    avgCallDuration: Math.floor(Math.random() * 300) + 180,
    avgSentimentScore: Number((Math.random() * 1).toFixed(2)),
    avgConversionRate: Number((Math.random() * 0.4 + 0.1).toFixed(2)),
    topPerformers: Array.from({ length: 5 }).map((_, i) => ({
      id: `rep-${i}`,
      name: `Team Member ${i + 1}`,
      value: Math.floor(Math.random() * 100),
      change: Number((Math.random() * 20 - 10).toFixed(1)),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      performance: Math.random() > 0.7 ? 'good' : Math.random() > 0.3 ? 'average' : 'poor',
    })),
    trending: {
      callVolume: {
        value: Math.floor(Math.random() * 100),
        change: Number((Math.random() * 20 - 10).toFixed(1)),
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
      conversions: {
        value: Number((Math.random() * 0.4 + 0.1).toFixed(2)),
        change: Number((Math.random() * 20 - 10).toFixed(1)),
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
      avgDuration: {
        value: Math.floor(Math.random() * 60) + 120,
        change: Number((Math.random() * 20 - 10).toFixed(1)),
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
    },
  };
};

const generateMockRepMetrics = (id: string, name: string): RepMetrics => {
  return {
    id,
    name,
    callVolume: Math.floor(Math.random() * 200) + 50,
    avgDuration: Math.floor(Math.random() * 300) + 180,
    sentimentScore: Number((Math.random() * 1).toFixed(2)),
    successRate: Number((Math.random() * 0.6 + 0.2).toFixed(2)),
    objectionHandlingScore: Math.floor(Math.random() * 100),
    positiveLanguageScore: Math.floor(Math.random() * 100),
    talkRatio: Number((Math.random() * 0.6 + 0.2).toFixed(2)),
    recentCalls: Array.from({ length: 5 }).map((_, i) => ({
      id: `call-${i}`,
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      customer: `Customer ${i + 1}`,
      duration: Math.floor(Math.random() * 600) + 60,
      sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative',
      outcome: Math.random() > 0.6 ? 'successful' : 'unsuccessful',
    })),
    topKeywords: ['product', 'pricing', 'features', 'support', 'upgrade'].slice(0, Math.floor(Math.random() * 5) + 1),
  };
};

// Custom hooks for accessing metrics
export const useTeamMetrics = (): {
  metrics: TeamMetrics;
  isLoading: boolean;
  error: Error | null;
  refreshMetrics: () => void;
} => {
  const [metrics, setMetrics] = useState<TeamMetrics>(generateMockTeamMetrics());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshMetrics = () => {
    setIsLoading(true);
    try {
      const newMetrics = generateMockTeamMetrics();
      setMetrics(newMetrics);
      setError(null);
      EventsService.dispatchEvent('metrics-refreshed' as EventType, {
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh team metrics'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  // Listen for events that should trigger a refresh
  useEffect(() => {
    const unsubscribe = EventsService.addEventListener('call-updated', refreshMetrics);
    return unsubscribe;
  }, []);

  return { metrics, isLoading, error, refreshMetrics };
};

export const useRepMetrics = (repId?: string): {
  metrics: RepMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refreshMetrics: () => void;
} => {
  const [metrics, setMetrics] = useState<RepMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshMetrics = () => {
    setIsLoading(true);
    try {
      if (repId) {
        const newMetrics = generateMockRepMetrics(repId, `Rep ${repId}`);
        setMetrics(newMetrics);
        setError(null);
      } else {
        setMetrics(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh rep metrics'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (repId) {
      refreshMetrics();
    } else {
      setMetrics(null);
    }
  }, [repId]);

  // Listen for events that should trigger a refresh
  useEffect(() => {
    if (!repId) return;
    const unsubscribe = EventsService.addEventListener('call-updated', refreshMetrics);
    return unsubscribe;
  }, [repId]);

  return { metrics, isLoading, error, refreshMetrics };
};
