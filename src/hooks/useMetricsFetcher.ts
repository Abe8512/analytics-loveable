
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RawMetricsRecord, MetricsFilters } from '@/types/metrics';
import { useToast } from '@/hooks/use-toast';
import { formatError } from '@/utils/errorUtils';

interface MetricsFetcherOptions {
  initialLoad?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  filters?: MetricsFilters;
}

interface MetricsFetcherResult {
  data: RawMetricsRecord | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isUsingDemoData: boolean;
  refresh: (force?: boolean) => Promise<void>;
}

// Simple client-side cache for metrics data
const metricsCache: Record<string, {
  data: RawMetricsRecord;
  timestamp: number;
  filters?: MetricsFilters;
}> = {};

export const useMetricsFetcher = (options: MetricsFetcherOptions = {}): MetricsFetcherResult => {
  const [data, setData] = useState<RawMetricsRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.initialLoad !== false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState<boolean>(false);
  
  const { toast } = useToast();
  const { cacheKey, cacheDuration = 60000, filters } = options; // Default 1 minute cache

  // Function to generate a demo metrics record for fallback
  const generateDemoMetrics = useCallback((): RawMetricsRecord => {
    console.log('Generating demo metrics as fallback');
    const today = new Date();
    
    return {
      id: 'demo-metrics',
      report_date: today.toISOString().split('T')[0],
      total_calls: 42,
      avg_duration: 348,
      total_duration: 14616,
      positive_sentiment_count: 28,
      negative_sentiment_count: 5,
      neutral_sentiment_count: 9,
      avg_sentiment: 0.76,
      agent_talk_ratio: 46,
      customer_talk_ratio: 54,
      performance_score: 82,
      conversion_rate: 0.35,
      top_keywords: ['pricing', 'feature', 'support', 'timeline', 'demo']
    };
  }, []);

  // Function to fetch metrics data from database
  const fetchMetricsData = useCallback(async (force = false): Promise<void> => {
    // Check cache first if not forced refresh
    if (cacheKey && !force && metricsCache[cacheKey]) {
      const cachedData = metricsCache[cacheKey];
      const now = Date.now();
      
      // If cache is still valid, use it
      if (now - cachedData.timestamp < cacheDuration) {
        console.log(`Using cached metrics data for key: ${cacheKey}`);
        setData(cachedData.data);
        setLastUpdated(new Date(cachedData.timestamp));
        setIsLoading(false);
        setIsError(false);
        setError(null);
        setIsUsingDemoData(false);
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build the base query
      let query = supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(1);
        
      // Apply date filters if available
      if (filters?.dateRange?.from) {
        query = query.gte('report_date', filters.dateRange.from.toISOString().split('T')[0]);
      }
      
      if (filters?.dateRange?.to) {
        query = query.lte('report_date', filters.dateRange.to.toISOString().split('T')[0]);
      }

      // Execute query
      const { data: metricsData, error: dbError } = await query;
      
      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      if (!metricsData || metricsData.length === 0) {
        console.log('No metrics data found in database, trying calls table for raw calculation...');
        
        // Try to calculate metrics from calls table if no summary data exists
        const result = await fetchAndCalculateFromCalls();
        
        if (result) {
          setData(result);
          setLastUpdated(new Date());
          setIsLoading(false);
          setIsError(false);
          setError(null);
          setIsUsingDemoData(false);
          
          // Cache the calculated results
          if (cacheKey) {
            metricsCache[cacheKey] = {
              data: result,
              timestamp: Date.now(),
              filters
            };
          }
          
          return;
        }
        
        // If both approaches fail, use demo data
        const demoData = generateDemoMetrics();
        setData(demoData);
        setLastUpdated(new Date());
        setIsLoading(false);
        setIsError(false);
        setError(null);
        setIsUsingDemoData(true);
        
        // Cache the demo data but with shorter expiration
        if (cacheKey) {
          metricsCache[cacheKey] = {
            data: demoData,
            timestamp: Date.now() - (cacheDuration / 2), // Set shorter expiration for demo data
            filters
          };
        }
        
        return;
      }
      
      // We have real metrics data
      setData(metricsData[0]);
      setLastUpdated(new Date());
      setIsLoading(false);
      setIsError(false);
      setError(null);
      setIsUsingDemoData(false);
      
      // Cache the result
      if (cacheKey) {
        metricsCache[cacheKey] = {
          data: metricsData[0],
          timestamp: Date.now(),
          filters
        };
      }
      
    } catch (err) {
      console.error('Error fetching metrics data:', err);
      setIsError(true);
      setError(formatError(err));
      setIsLoading(false);
      
      // Use demo data as fallback
      const demoData = generateDemoMetrics();
      setData(demoData);
      setIsUsingDemoData(true);
    }
  }, [cacheKey, cacheDuration, filters, generateDemoMetrics]);
  
  // Helper function to calculate metrics directly from calls table
  const fetchAndCalculateFromCalls = async (): Promise<RawMetricsRecord | null> => {
    try {
      // Fetch call data
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('duration, sentiment_agent, sentiment_customer, talk_ratio_agent, talk_ratio_customer, key_phrases, created_at');
      
      if (callsError || !callsData || callsData.length === 0) {
        return null;
      }
      
      // Calculate metrics
      const totalCalls = callsData.length;
      const totalDuration = callsData.reduce((sum, call) => sum + (call.duration || 0), 0);
      const avgDuration = totalDuration / totalCalls;
      
      // Count sentiment categories
      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;
      let totalSentiment = 0;
      
      callsData.forEach(call => {
        const sentiment = call.sentiment_agent || 0.5;
        totalSentiment += sentiment;
        
        if (sentiment > 0.66) positiveCount++;
        else if (sentiment < 0.33) negativeCount++;
        else neutralCount++;
      });
      
      const avgSentiment = totalSentiment / totalCalls;
      
      // Calculate talk ratios
      const avgAgentTalkRatio = callsData.reduce((sum, call) => sum + (call.talk_ratio_agent || 50), 0) / totalCalls;
      const avgCustomerTalkRatio = callsData.reduce((sum, call) => sum + (call.talk_ratio_customer || 50), 0) / totalCalls;
      
      // Extract keywords
      const keywordsMap = new Map<string, number>();
      callsData.forEach(call => {
        if (call.key_phrases && Array.isArray(call.key_phrases)) {
          call.key_phrases.forEach(phrase => {
            keywordsMap.set(phrase, (keywordsMap.get(phrase) || 0) + 1);
          });
        }
      });
      
      // Sort keywords by frequency
      const topKeywords = Array.from(keywordsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
      
      // Assemble metrics record
      return {
        id: 'calculated-metrics',
        report_date: new Date().toISOString().split('T')[0],
        total_calls: totalCalls,
        total_duration: totalDuration,
        avg_duration: avgDuration,
        positive_sentiment_count: positiveCount,
        negative_sentiment_count: negativeCount,
        neutral_sentiment_count: neutralCount,
        avg_sentiment: avgSentiment,
        agent_talk_ratio: avgAgentTalkRatio,
        customer_talk_ratio: avgCustomerTalkRatio,
        performance_score: Math.round(avgSentiment * 100),
        conversion_rate: 0.3, // Default/mock value
        top_keywords: topKeywords
      };
    } catch (err) {
      console.error('Error calculating metrics from calls:', err);
      return null;
    }
  };

  // Function to manually refresh the data
  const refresh = useCallback(async (force = true): Promise<void> => {
    try {
      await fetchMetricsData(force);
      
      if (!isUsingDemoData) {
        toast({
          title: "Metrics Refreshed",
          description: "Latest performance data has been loaded",
        });
      }
    } catch (err) {
      console.error('Error refreshing metrics:', err);
      toast({
        title: "Refresh Failed",
        description: formatError(err),
        variant: "destructive",
      });
    }
  }, [fetchMetricsData, isUsingDemoData, toast]);

  // Initial data fetch on mount
  useEffect(() => {
    if (options.initialLoad !== false) {
      fetchMetricsData(false);
    }
    
    // Set up refresh interval (5 minutes)
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing metrics data...');
      fetchMetricsData(true);
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMetricsData, options.initialLoad]);

  return {
    data,
    isLoading,
    isError,
    error,
    lastUpdated,
    isUsingDemoData,
    refresh
  };
};

// Utility function to clear all cached metrics data
export const clearMetricsCache = (): void => {
  Object.keys(metricsCache).forEach(key => {
    delete metricsCache[key];
  });
  console.log('Cleared all metrics cache entries');
};

// Utility function to clear specific metrics cache by key
export const clearMetricsCacheByKey = (key: string): void => {
  if (metricsCache[key]) {
    delete metricsCache[key];
    console.log(`Cleared metrics cache for key: ${key}`);
    return;
  }
  console.log(`No metrics cache found for key: ${key}`);
};
