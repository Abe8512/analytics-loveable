
import { useState, useEffect, useCallback } from 'react';
import { RawMetricsRecord, MetricsFilters } from '@/types/metrics';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { formatError } from '@/utils/errorUtils';

// Cache for metrics data
const metricsCache = new Map<string, {
  data: RawMetricsRecord | null;
  timestamp: number;
  lastUpdated: Date | null;
}>();

// Function to generate a cache key based on filters
const generateCacheKey = (filters?: MetricsFilters): string => {
  if (!filters) return 'default';
  
  const dateRange = filters.dateRange 
    ? `${filters.dateRange.from?.toISOString() || ''}-${filters.dateRange.to?.toISOString() || ''}` 
    : '';
    
  const repIds = filters.repIds ? filters.repIds.join(',') : '';
  
  return `metrics-${dateRange}-${repIds}`;
};

// Clear metrics cache for a specific key or all keys
export const clearMetricsCache = (cacheKey?: string): void => {
  if (cacheKey) {
    metricsCache.delete(cacheKey);
    console.log(`Cleared metrics cache for key: ${cacheKey}`);
  } else {
    metricsCache.clear();
    console.log('Cleared all metrics cache');
  }
};

/**
 * Checks if metrics data is available in the database
 * @returns {Promise<boolean>} True if metrics data exists
 */
export const checkMetricsAvailability = async (): Promise<boolean> => {
  try {
    console.log('Checking for metrics data availability...');
    
    // Try call_metrics_summary first
    const { data: metricsData, error: metricsError } = await supabase
      .from('call_metrics_summary')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (!metricsError && metricsData && (metricsData as any)?.count > 0) {
      console.log(`Found ${(metricsData as any)?.count} metrics records`);
      return true;
    }
    
    // If no metrics summary, check if there are calls directly
    const { data: callsData, error: callsError } = await supabase
      .from('calls')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (!callsError && callsData) {
      const callCount = (callsData as any)?.count ?? 0;
      console.log(`Found ${callCount} call records`);
      return callCount > 0;
    }
    
    // If no calls data, check if there are transcripts from Whisper
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('call_transcripts')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (!transcriptError && transcriptData) {
      const transcriptCount = (transcriptData as any)?.count ?? 0;
      console.log(`Found ${transcriptCount} transcript records`);
      return transcriptCount > 0;
    }
    
    console.log('No metrics data found in any table');
    return false;
  } catch (err) {
    console.error('Exception in checkMetricsAvailability:', err);
    return false;
  }
};

interface UseMetricsFetcherOptions {
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  filters?: MetricsFilters;
  shouldSubscribe?: boolean;
}

/**
 * Custom hook for fetching metrics data with caching and real-time updates
 */
export const useMetricsFetcher = (options: UseMetricsFetcherOptions = {}) => {
  const { 
    cacheKey: providedCacheKey, 
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    filters,
    shouldSubscribe = true
  } = options;
  
  const cacheKey = providedCacheKey || generateCacheKey(filters);
  
  const [data, setData] = useState<RawMetricsRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Fetch metrics data
  const fetchMetrics = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh && metricsCache.has(cacheKey)) {
        const cachedData = metricsCache.get(cacheKey);
        
        if (cachedData && (Date.now() - cachedData.timestamp < cacheDuration)) {
          console.log(`Using cached metrics data for key: ${cacheKey}`);
          setData(cachedData.data);
          setLastUpdated(cachedData.lastUpdated);
          setIsUsingDemoData(false);
          setIsLoading(false);
          return;
        }
      }
      
      console.log(`Fetching metrics data with key: ${cacheKey}`, filters);
      
      // Build the query based on filters
      let query = supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false });
      
      // Apply date range filter if provided
      if (filters?.dateRange?.from && filters?.dateRange?.to) {
        const fromDate = format(filters.dateRange.from, 'yyyy-MM-dd');
        const toDate = format(filters.dateRange.to, 'yyyy-MM-dd');
        
        query = query
          .gte('report_date', fromDate)
          .lte('report_date', toDate);
      }
      
      // Apply rep filter if provided
      if (filters?.repIds && filters.repIds.length > 0) {
        // Prepare for filtering by rep ID in the calls table if needed as a fallback
        console.log('Using rep filters:', filters.repIds);
      }
      
      const { data: metricsData, error: fetchError } = await query.limit(1);
      
      if (fetchError) {
        throw fetchError;
      }
      
      const now = new Date();
      
      if (metricsData && metricsData.length > 0) {
        console.log('Successfully fetched metrics data');
        // Use type assertion to cast to RawMetricsRecord
        const metrics = metricsData[0] as unknown as RawMetricsRecord;
        setData(metrics);
        setLastUpdated(now);
        setIsUsingDemoData(false);
        
        // Update cache
        metricsCache.set(cacheKey, {
          data: metrics,
          timestamp: Date.now(),
          lastUpdated: now
        });
      } else {
        console.log('No metrics data found, checking calls table directly');
        
        // Try to get data directly from calls table as a fallback
        try {
          let callsQuery = supabase
            .from('calls')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (filters?.repIds && filters.repIds.length > 0) {
            callsQuery = callsQuery.in('user_id', filters.repIds);
          }
          
          const { data: callsData, error: callsError } = await callsQuery.limit(20);
          
          if (!callsError && callsData && callsData.length > 0) {
            console.log('Found raw calls data, calculating metrics manually');
            
            // Calculate simple metrics from calls data
            const rawMetrics: RawMetricsRecord = {
              total_calls: callsData.length,
              avg_duration: callsData.reduce((sum, call) => sum + (call.duration || 0), 0) / callsData.length,
              positive_sentiment_count: callsData.filter(call => (call.sentiment_agent || 0) > 0.66).length,
              negative_sentiment_count: callsData.filter(call => (call.sentiment_agent || 0) < 0.33).length,
              neutral_sentiment_count: callsData.filter(call => {
                const sentiment = call.sentiment_agent || 0.5;
                return sentiment >= 0.33 && sentiment <= 0.66;
              }).length,
              avg_sentiment: callsData.reduce((sum, call) => sum + (call.sentiment_agent || 0.5), 0) / callsData.length,
              agent_talk_ratio: callsData.reduce((sum, call) => sum + (call.talk_ratio_agent || 50), 0) / callsData.length,
              customer_talk_ratio: callsData.reduce((sum, call) => sum + (call.talk_ratio_customer || 50), 0) / callsData.length
            };
            
            setData(rawMetrics);
            setLastUpdated(now);
            setIsUsingDemoData(false);
            
            // Update cache
            metricsCache.set(cacheKey, {
              data: rawMetrics,
              timestamp: Date.now(),
              lastUpdated: now
            });
            
            return;
          }
        } catch (callsError) {
          console.error('Error fetching from calls table:', callsError);
        }
        
        console.log('No metrics or calls data found');
        // Return empty data instead of demo data
        setData(null);
        setLastUpdated(now);
        setIsUsingDemoData(false);
        
        // Cache the empty result too
        metricsCache.set(cacheKey, {
          data: null,
          timestamp: Date.now(),
          lastUpdated: now
        });
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setIsError(true);
      setError(formatError(err));
      setData(null);
      setLastUpdated(new Date());
      setIsUsingDemoData(false);
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, cacheDuration, filters]);
  
  // Handle real-time updates via Supabase subscription
  useEffect(() => {
    if (!shouldSubscribe) return;
    
    // Set up real-time subscription for metrics updates
    const channel = supabase
      .channel('metrics-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'call_metrics_summary' }, 
        payload => {
          console.log('Received real-time metrics update:', payload);
          
          // Update local state and cache with new data
          const newData = payload.new as unknown as RawMetricsRecord;
          const now = new Date();
          
          setData(newData);
          setLastUpdated(now);
          setIsUsingDemoData(false);
          
          // Update cache
          metricsCache.set(cacheKey, {
            data: newData,
            timestamp: Date.now(),
            lastUpdated: now
          });
        })
      .subscribe((status) => {
        console.log('Metrics subscription status:', status);
      });
      
    // Also subscribe to call_transcripts changes to catch Whisper transcriptions
    const transcriptChannel = supabase
      .channel('transcript-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'call_transcripts' },
        payload => {
          console.log('New transcript detected, refreshing metrics:', payload);
          // Force refresh metrics when a new transcript is added
          fetchMetrics(true);
        })
      .subscribe((status) => {
        console.log('Transcript subscription status:', status);
      });
    
    // Clean up the subscriptions
    return () => {
      console.log('Cleaning up metrics subscription');
      supabase.removeChannel(channel);
      supabase.removeChannel(transcriptChannel);
    };
  }, [cacheKey, shouldSubscribe, fetchMetrics]);
  
  // Initial data fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);
  
  return {
    data,
    isLoading,
    isError,
    error,
    isUsingDemoData,
    refresh: fetchMetrics,
    lastUpdated
  };
};
