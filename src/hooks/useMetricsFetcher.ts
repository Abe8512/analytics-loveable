
import { useState, useEffect, useCallback } from 'react';
import { RawMetricsRecord, MetricsFilters } from '@/types/metrics';
import { format } from 'date-fns';
import { generateDemoCallMetrics } from '@/services/DemoDataService';
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
          setIsUsingDemoData(cachedData.data === null);
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
        // If we had a rep_id column in the metrics table, we would filter by it
        // For now, we're assuming the metrics are aggregated for all reps
      }
      
      const { data: metricsData, error: fetchError } = await query.limit(1);
      
      if (fetchError) {
        throw fetchError;
      }
      
      const now = new Date();
      
      if (metricsData && metricsData.length > 0) {
        console.log('Successfully fetched metrics data');
        const metrics = metricsData[0] as RawMetricsRecord;
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
        console.log('No metrics data found, using demo data');
        // Use demo data if no metrics found
        const demoData = generateDemoCallMetrics()[0] as RawMetricsRecord;
        setData(demoData);
        setLastUpdated(now);
        setIsUsingDemoData(true);
        
        // Cache the demo data too
        metricsCache.set(cacheKey, {
          data: demoData,
          timestamp: Date.now(),
          lastUpdated: now
        });
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setIsError(true);
      setError(formatError(err));
      
      // Use demo data in case of error
      const demoData = generateDemoCallMetrics()[0] as RawMetricsRecord;
      setData(demoData);
      setLastUpdated(new Date());
      setIsUsingDemoData(true);
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
          const newData = payload.new as RawMetricsRecord;
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
      
    // Clean up the subscription
    return () => {
      console.log('Cleaning up metrics subscription');
      supabase.removeChannel(channel);
    };
  }, [cacheKey, shouldSubscribe]);
  
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
