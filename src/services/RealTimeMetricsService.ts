import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from './ErrorHandlingService';
import { useToast } from '@/hooks/use-toast';
import { EventType, useEventsStore } from './events';
import { useDataFetch, clearCacheEntry } from '@/hooks/useDataFetch';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { MetricUpdate, MetricUpdateType, MetricValue } from './RealTimeMetrics.types';
import { v4 as uuidv4 } from 'uuid';
import { EventsStore } from './events/store';

export interface TeamMetric {
  team_name: string;
  call_count: number;
  avg_sentiment: number;
  avg_duration: number;
  conversion_rate: number;
  success_rate: number;
  date?: string;
  id?: string;
}

export interface RepMetric {
  rep_name: string;
  rep_id: string;
  call_count: number;
  avg_sentiment: number;
  avg_duration: number;
  conversion_rate: number;
  success_rate: number;
  top_keywords?: string[];
}

// Type for the cache status
interface CacheStatus {
  teamMetricsLastUpdated: number | null;
  repMetricsLastUpdated: number | null;
}

// In-memory cache status tracking
const cacheStatus: CacheStatus = {
  teamMetricsLastUpdated: null,
  repMetricsLastUpdated: null
};

// Main hook that provides both team and rep metrics with enhanced caching
export const useRealTimeMetrics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [repMetrics, setRepMetrics] = useState<RepMetric[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const { toast } = useToast();
  
  // Use our enhanced data fetch hook for better caching
  const {
    data: teamMetricsData,
    isLoading: isTeamMetricsLoading,
    error: teamMetricsError,
    refetch: refetchTeamMetrics,
    timestamp: teamTimestamp
  } = useDataFetch<TeamMetric[]>({
    fetchFn: fetchTeamMetricsData,
    initialData: [],
    cacheKey: 'team-metrics',
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    onError: (err) => {
      console.error('Error fetching team metrics:', err);
      errorHandler.handleError(err, 'RealTimeMetricsService.useRealTimeMetrics.teamMetrics');
    }
  });
  
  const {
    data: repMetricsData,
    isLoading: isRepMetricsLoading,
    error: repMetricsError,
    refetch: refetchRepMetrics,
    timestamp: repTimestamp
  } = useDataFetch<RepMetric[]>({
    fetchFn: fetchRepMetricsData,
    initialData: [],
    cacheKey: 'rep-metrics',
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    onError: (err) => {
      console.error('Error fetching rep metrics:', err);
      errorHandler.handleError(err, 'RealTimeMetricsService.useRealTimeMetrics.repMetrics');
    }
  });
  
  // Update state when data fetches complete
  useEffect(() => {
    if (teamMetricsData) {
      setTeamMetrics(teamMetricsData);
      cacheStatus.teamMetricsLastUpdated = teamTimestamp;
    }
    
    if (repMetricsData) {
      setRepMetrics(repMetricsData);
      cacheStatus.repMetricsLastUpdated = repTimestamp;
    }
    
    setIsLoading(isTeamMetricsLoading || isRepMetricsLoading);
    
    const latestError = teamMetricsError || repMetricsError;
    if (latestError) {
      setError(latestError instanceof Error ? latestError : new Error(String(latestError)));
    } else {
      setError(null);
    }
    
    // Update last refreshed timestamp based on most recent data
    if (teamTimestamp || repTimestamp) {
      const latest = Math.max(teamTimestamp || 0, repTimestamp || 0);
      if (latest > 0) {
        setLastRefreshed(new Date(latest));
      }
    }
  }, [
    teamMetricsData, repMetricsData, 
    isTeamMetricsLoading, isRepMetricsLoading,
    teamMetricsError, repMetricsError,
    teamTimestamp, repTimestamp
  ]);
  
  // Function to fetch team metrics
  async function fetchTeamMetricsData(): Promise<TeamMetric[]> {
    try {
      console.log('Fetching team metrics data...');
      
      // First try to get data from call_metrics_summary table
      const { data: metricsData, error: metricsError } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(30);
        
      if (!metricsError && metricsData && metricsData.length > 0) {
        console.log(`Successfully retrieved ${metricsData.length} team metrics records`);
        
        // Map database records to TeamMetric interface
        return metricsData.map(record => ({
          id: record.id,
          team_name: 'Sales Team',
          call_count: record.total_calls || 0,
          avg_sentiment: record.avg_sentiment || 0.5,
          avg_duration: record.avg_duration || 0,
          conversion_rate: record.conversion_rate || 0,
          success_rate: record.performance_score || 50,
          date: record.report_date
        }));
      }
      
      // If we couldn't get data from metrics summary, try computing from calls table
      console.log('No team metrics data found in summary, calculating from calls...');
      const calculatedMetrics = await calculateTeamMetricsFromCalls();
      
      if (calculatedMetrics) {
        return [calculatedMetrics];
      }
      
      // Fallback to demo data if both approaches fail
      console.log('Falling back to demo team metrics');
      return [{
        id: 'demo-1',
        team_name: 'Sales Team',
        call_count: 156,
        avg_sentiment: 0.72,
        avg_duration: 324, 
        conversion_rate: 28,
        success_rate: 65,
        date: new Date().toISOString().split('T')[0]
      }];
    } catch (err) {
      console.error('Error in fetchTeamMetricsData:', err);
      throw err;
    }
  }
  
  // Helper function to calculate team metrics directly from calls
  async function calculateTeamMetricsFromCalls(): Promise<TeamMetric | null> {
    try {
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('duration, sentiment_agent, created_at');
        
      if (callsError || !callsData || callsData.length === 0) {
        return null;
      }
      
      // Calculate team metrics from calls data
      const totalCalls = callsData.length;
      const avgDuration = callsData.reduce((sum, call) => sum + (call.duration || 0), 0) / totalCalls;
      const avgSentiment = callsData.reduce((sum, call) => sum + (call.sentiment_agent || 0.5), 0) / totalCalls;
      
      // Use calculation for success rate (consider calls with sentiment > 0.6 as successful)
      const successfulCalls = callsData.filter(call => (call.sentiment_agent || 0) > 0.6).length;
      const successRate = (successfulCalls / totalCalls) * 100;
      
      return {
        team_name: 'Sales Team',
        call_count: totalCalls,
        avg_sentiment: avgSentiment,
        avg_duration: avgDuration,
        conversion_rate: Math.round((successfulCalls / totalCalls) * 100) / 3, // arbitrary conversion calculation
        success_rate: successRate,
        date: new Date().toISOString().split('T')[0]
      };
    } catch (err) {
      console.error('Error calculating team metrics from calls:', err);
      return null;
    }
  }
  
  // Function to fetch rep metrics
  async function fetchRepMetricsData(): Promise<RepMetric[]> {
    try {
      console.log('Fetching rep metrics data...');
      
      // First try to get data from rep_metrics_summary table
      const { data: repData, error: repError } = await supabase
        .from('rep_metrics_summary')
        .select('*')
        .order('call_volume', { ascending: false });
        
      if (!repError && repData && repData.length > 0) {
        console.log(`Successfully retrieved ${repData.length} rep metrics records`);
        
        // Map database records to RepMetric interface
        return repData.map(record => ({
          rep_name: record.rep_name || `Rep ${record.rep_id.substring(0, 5)}`,
          rep_id: record.rep_id,
          call_count: record.call_volume || 0,
          avg_sentiment: record.sentiment_score || 0.5,
          avg_duration: 0, // Not available in the original data
          conversion_rate: 0, // Not available in the original data
          success_rate: record.success_rate || 0,
          top_keywords: record.top_keywords || []
        }));
      }
      
      // If no rep metrics found, try to calculate from calls
      console.log('No rep metrics found in summary, calculating from calls...');
      const repMetrics = await calculateRepMetricsFromCalls();
      
      if (repMetrics.length > 0) {
        return repMetrics;
      }
      
      // Fallback to demo data
      console.log('Falling back to demo rep metrics');
      return [
        {
          rep_name: 'Sarah Johnson',
          rep_id: 'user-1',
          call_count: 42,
          avg_sentiment: 0.78,
          avg_duration: 340,
          conversion_rate: 32,
          success_rate: 76,
          top_keywords: ['pricing', 'demo', 'features']
        },
        {
          rep_name: 'Michael Chen',
          rep_id: 'user-2',
          call_count: 38,
          avg_sentiment: 0.68,
          avg_duration: 290,
          conversion_rate: 24,
          success_rate: 62,
          top_keywords: ['support', 'integration', 'timeline']
        }
      ];
    } catch (err) {
      console.error('Error in fetchRepMetricsData:', err);
      throw err;
    }
  }
  
  // Helper function to calculate rep metrics from calls
  async function calculateRepMetricsFromCalls(): Promise<RepMetric[]> {
    try {
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('user_id, duration, sentiment_agent, key_phrases');
        
      if (callsError || !callsData || callsData.length === 0) {
        return [];
      }
      
      // Group calls by user_id
      const callsByRep = callsData.reduce((acc, call) => {
        const userId = call.user_id || 'unknown';
        if (!acc[userId]) {
          acc[userId] = [];
        }
        acc[userId].push(call);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Calculate metrics for each rep
      return Object.entries(callsByRep).map(([repId, calls]) => {
        const callCount = calls.length;
        const avgSentiment = calls.reduce((sum, call) => sum + (call.sentiment_agent || 0.5), 0) / callCount;
        const avgDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0) / callCount;
        
        // Calculate success rate based on sentiment
        const successfulCalls = calls.filter(call => (call.sentiment_agent || 0) > 0.6).length;
        const successRate = (successfulCalls / callCount) * 100;
        
        // Extract keywords
        const keywordsMap = new Map<string, number>();
        calls.forEach(call => {
          if (call.key_phrases && Array.isArray(call.key_phrases)) {
            call.key_phrases.forEach(phrase => {
              keywordsMap.set(phrase, (keywordsMap.get(phrase) || 0) + 1);
            });
          }
        });
        
        // Get top keywords
        const topKeywords = Array.from(keywordsMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(entry => entry[0]);
          
        return {
          rep_name: `Rep ${repId.substring(0, 5)}`,
          rep_id: repId,
          call_count: callCount,
          avg_sentiment: avgSentiment,
          avg_duration: avgDuration,
          conversion_rate: Math.round((successfulCalls / callCount) * 100) / 3, // arbitrary conversion calculation
          success_rate: successRate,
          top_keywords: topKeywords
        };
      });
    } catch (err) {
      console.error('Error calculating rep metrics from calls:', err);
      return [];
    }
  }
  
  // Set up realtime subscription for metrics updates
  const setupRealtimeSubscription = useCallback(() => {
    console.log('Setting up realtime subscription for metrics...');
    
    const channel = supabase
      .channel('metrics-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'call_metrics_summary'
      }, () => {
        console.log('Call metrics changed, refreshing data...');
        invalidateTeamMetricsCache();
        refetchTeamMetrics();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rep_metrics_summary'
      }, () => {
        console.log('Rep metrics changed, refreshing data...');
        invalidateRepMetricsCache();
        refetchRepMetrics();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calls'
      }, () => {
        console.log('Calls table changed, considering metrics refresh...');
        
        // Only refresh if metrics cache is older than 1 minute
        const now = Date.now();
        const shouldRefreshTeam = !cacheStatus.teamMetricsLastUpdated || 
          (now - cacheStatus.teamMetricsLastUpdated > 60000);
        const shouldRefreshRep = !cacheStatus.repMetricsLastUpdated || 
          (now - cacheStatus.repMetricsLastUpdated > 60000);
          
        if (shouldRefreshTeam) {
          invalidateTeamMetricsCache();
          refetchTeamMetrics();
        }
        
        if (shouldRefreshRep) {
          invalidateRepMetricsCache();
          refetchRepMetrics();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime metrics changes');
        } else {
          console.warn('Realtime subscription status:', status);
        }
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchTeamMetrics, refetchRepMetrics]);
  
  // Helper functions to invalidate caches
  function invalidateTeamMetricsCache() {
    clearCacheEntry('team-metrics');
    cacheStatus.teamMetricsLastUpdated = null;
  }
  
  function invalidateRepMetricsCache() {
    clearCacheEntry('rep-metrics');
    cacheStatus.repMetricsLastUpdated = null;
  }
  
  // Setup event listeners and realtime subscription
  useEffect(() => {
    // Set up event listeners for metrics updates
    const unsubscribe = useEventsStore.subscribe((state) => {
      const unsub = state.addEventListener('calls-updated' as EventType, () => {
        console.log('Calls updated event received, refreshing metrics...');
        invalidateTeamMetricsCache();
        invalidateRepMetricsCache();
        refetchTeamMetrics();
        refetchRepMetrics();
      });
      return unsub;
    });
    
    // Set up realtime subscription
    const unsubscribeRealtime = setupRealtimeSubscription();
    
    // Set up polling for metrics
    const pollingInterval = setInterval(() => {
      console.log('Polling for metrics updates...');
      refetchTeamMetrics();
      refetchRepMetrics();
    }, 5 * 60 * 1000); // Poll every 5 minutes
    
    return () => {
      unsubscribe();
      unsubscribeRealtime();
      clearInterval(pollingInterval);
    };
  }, [refetchTeamMetrics, refetchRepMetrics, setupRealtimeSubscription]);
  
  // Function to manually refresh data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Invalidate caches
      invalidateTeamMetricsCache();
      invalidateRepMetricsCache();
      
      // Refresh both metrics types
      await Promise.all([
        refetchTeamMetrics(),
        refetchRepMetrics()
      ]);
      
      setLastRefreshed(new Date());
      setIsLoading(false);
      
      toast({
        title: 'Metrics Refreshed',
        description: 'Performance metrics have been updated',
      });
    } catch (err) {
      console.error('Error refreshing metrics data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      
      toast({
        title: 'Refresh Failed',
        description: 'Could not update performance metrics',
        variant: 'destructive',
      });
    }
  }, [refetchTeamMetrics, refetchRepMetrics, toast]);
  
  return {
    teamMetrics,
    repMetrics,
    isLoading,
    error,
    lastRefreshed,
    refreshData
  };
};

// Export separate hooks for components that only need team or rep metrics
export const useTeamMetrics = () => {
  const { teamMetrics, isLoading, error, refreshData } = useRealTimeMetrics();
  return { metrics: teamMetrics, isLoading, error, refresh: refreshData };
};

export const useRepMetrics = () => {
  const { repMetrics, isLoading, error, refreshData } = useRealTimeMetrics();
  return { metrics: repMetrics, isLoading, error, refresh: refreshData };
};
