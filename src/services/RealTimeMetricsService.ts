import { useState, useEffect } from 'react';
import { TeamPerformanceMetric, TeamPerformance } from '@/types/teamTypes';
import { EventsService } from './EventsService';
import { supabase } from '@/integrations/supabase/client';
import { TeamPerformance } from '@/types/teamTypes';
import { EventsStore } from './events/store';
import { EventType, EVENT_TYPES } from './events/types';
import { MetricsData } from '@/types/metrics';
import { TeamPerformance } from '@/types/teamTypes';
import { createEmptySentimentTrends, createEmptyTeamPerformance, createEmptyKeywordTrends, createEmptyCallVolume } from '@/utils/emptyStateUtils';

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

/**
 * Refresh all metrics data
 */
export const refreshMetrics = async () => {
  try {
    console.log('Refreshing all metrics data...');
    // Perform the refresh operations
    await Promise.all([
      refreshTeamPerformance(),
      refreshCallVolume(),
      refreshKeywordTrends()
    ]);
    
    // Dispatch event to notify components
    EventsStore.dispatchEvent(EVENT_TYPES.METRICS_REFRESHED as EventType, {
      timestamp: new Date().toISOString(),
      source: 'RealTimeMetricsService'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error refreshing metrics:', error);
    return { success: false, error };
  }
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

export interface RealTimeMetricsServiceInterface {
  getActiveListeners: () => number;
  registerPerformanceListener: (callback: (data: TeamPerformance) => void) => () => void;
  registerCallVolumeListener: (callback: (data: any[]) => void) => () => void;
  registerKeywordTrendsListener: (callback: (data: any[]) => void) => () => void;
  registerSentimentTrendsListener: (callback: (data: any[]) => void) => () => void;
  refreshAllMetrics: () => Promise<void>;
}

class RealTimeMetricsServiceClass implements RealTimeMetricsServiceInterface {
  private performanceListeners: ((data: TeamPerformance) => void)[] = [];
  private callVolumeListeners: ((data: any[]) => void)[] = [];
  private keywordTrendsListeners: ((data: any[]) => void)[] = [];
  private sentimentTrendsListeners: ((data: any[]) => void)[] = [];
  
  // Cache for metrics data
  private teamPerformanceCache: TeamPerformance | null = null;
  private callVolumeCache: any[] | null = null;
  private keywordTrendsCache: any[] | null = null;
  private sentimentTrendsCache: any[] | null = null;
  
  // Polling intervals
  private pollingIntervals: number[] = [];
  
  constructor() {
    // Start polling for metrics updates
    this.startPolling();
  }
  
  private startPolling() {
    // Poll for team performance every 30 seconds
    const performanceInterval = window.setInterval(() => {
      this.refreshTeamPerformance();
    }, 30 * 1000);
    
    // Poll for call volume every minute
    const callVolumeInterval = window.setInterval(() => {
      this.refreshCallVolume();
    }, 60 * 1000);
    
    // Poll for keyword trends every 2 minutes
    const keywordTrendsInterval = window.setInterval(() => {
      this.refreshKeywordTrends();
    }, 2 * 60 * 1000);
    
    // Poll for sentiment trends every 2 minutes
    const sentimentTrendsInterval = window.setInterval(() => {
      this.refreshSentimentTrends();
    }, 2 * 60 * 1000);
    
    // Store intervals so we can clear them later
    this.pollingIntervals = [
      performanceInterval,
      callVolumeInterval,
      keywordTrendsInterval,
      sentimentTrendsInterval
    ];
  }
  
  private stopPolling() {
    this.pollingIntervals.forEach(interval => {
      clearInterval(interval);
    });
  }
  
  /**
   * Get the number of active listeners
   */
  public getActiveListeners(): number {
    return this.performanceListeners.length + 
           this.callVolumeListeners.length + 
           this.keywordTrendsListeners.length + 
           this.sentimentTrendsListeners.length;
  }
  
  /**
   * Register a listener for team performance updates
   */
  public registerPerformanceListener(callback: (data: TeamPerformance) => void): () => void {
    this.performanceListeners.push(callback);
    
    // Immediately invoke with cached data if available
    if (this.teamPerformanceCache) {
      callback(this.teamPerformanceCache);
    } else {
      // Otherwise, fetch fresh data
      this.refreshTeamPerformance().then(data => {
        if (data) callback(data);
      });
    }
    
    // Return unsubscribe function
    return () => {
      this.performanceListeners = this.performanceListeners.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Register a listener for call volume updates
   */
  public registerCallVolumeListener(callback: (data: any[]) => void): () => void {
    this.callVolumeListeners.push(callback);
    
    // Immediately invoke with cached data if available
    if (this.callVolumeCache) {
      callback(this.callVolumeCache);
    } else {
      // Otherwise, fetch fresh data
      this.refreshCallVolume().then(data => {
        if (data) callback(data);
      });
    }
    
    // Return unsubscribe function
    return () => {
      this.callVolumeListeners = this.callVolumeListeners.filter(cb => cb !== callback);
    };
  }
  
  // Similar implementations for other listeners
  public registerKeywordTrendsListener(callback: (data: any[]) => void): () => void {
    // ... similar implementation to other listeners
    return () => {};
  }
  
  public registerSentimentTrendsListener(callback: (data: any[]) => void): () => void {
    // ... similar implementation to other listeners
    return () => {};
  }
  
  /**
   * Refresh all metrics data
   */
  public async refreshAllMetrics(): Promise<void> {
    // Implementation of the specific refresh functions
    const refreshTeamPerformanceImpl = async (): Promise<TeamPerformance | null> => {
      try {
        // In a real implementation, fetch data from API/database
        const data = createEmptyTeamPerformance();
        
        // Cache the data
        this.teamPerformanceCache = data;
        
        // Notify all listeners
        this.performanceListeners.forEach(listener => {
          listener(data);
        });
        
        return data;
      } catch (error) {
        console.error('Error refreshing team performance:', error);
        return null;
      }
    };
    
    const refreshCallVolumeImpl = async (): Promise<any[] | null> => {
      try {
        // In a real implementation, fetch data from API/database
        const data = createEmptyCallVolume();
        
        // Cache the data
        this.callVolumeCache = data;
        
        // Notify all listeners
        this.callVolumeListeners.forEach(listener => {
          listener(data);
        });
        
        return data;
      } catch (error) {
        console.error('Error refreshing call volume:', error);
        return null;
      }
    };
    
    const refreshKeywordTrendsImpl = async (): Promise<any[] | null> => {
      try {
        // In a real implementation, fetch data from API/database
        const data = createEmptyKeywordTrends();
        
        // Cache the data
        this.keywordTrendsCache = data;
        
        // Notify all listeners
        this.keywordTrendsListeners.forEach(listener => {
          listener(data);
        });
        
        return data;
      } catch (error) {
        console.error('Error refreshing keyword trends:', error);
        return null;
      }
    };
    
    const refreshSentimentTrendsImpl = async (): Promise<any[] | null> => {
      try {
        // In a real implementation, fetch data from API/database
        const data = createEmptySentimentTrends();
        
        // Cache the data
        this.sentimentTrendsCache = data;
        
        // Notify all listeners
        this.sentimentTrendsListeners.forEach(listener => {
          listener(data);
        });
        
        return data;
      } catch (error) {
        console.error('Error refreshing sentiment trends:', error);
        return null;
      }
    };
    
    // Call all refresh functions
    await Promise.all([
      refreshTeamPerformanceImpl(),
      refreshCallVolumeImpl(),
      refreshKeywordTrendsImpl(),
      refreshSentimentTrendsImpl()
    ]);
  }
  
  // Define the actual refreshTeamPerformance method
  private refreshTeamPerformance = refreshTeamPerformanceImpl;
  private refreshCallVolume = refreshCallVolumeImpl;
  private refreshKeywordTrends = refreshKeywordTrendsImpl;
  private refreshSentimentTrends = refreshSentimentTrendsImpl;
}

// Export a singleton instance
export const RealTimeMetricsService = new RealTimeMetricsServiceClass();
