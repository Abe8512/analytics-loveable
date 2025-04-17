
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Create a cache for metrics data
let metricsCache: any = null;
let lastFetchTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to clear the metrics cache
export const clearMetricsCache = () => {
  metricsCache = null;
  lastFetchTime = 0;
  console.log('Metrics cache cleared');
};

export const useMetricsFetcher = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  const fetchMetrics = useCallback(async (force: boolean = false) => {
    try {
      setIsLoading(true);
      
      // If we have cached data and the cache hasn't expired, use it
      const now = Date.now();
      if (!force && metricsCache && (now - lastFetchTime < CACHE_TTL)) {
        setData(metricsCache);
        setLastUpdated(new Date(lastFetchTime));
        setIsLoading(false);
        return metricsCache;
      }
      
      // Fetch from call_metrics_summary table
      const { data: metricsData, error: metricsError } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(1);
        
      if (metricsError) {
        throw metricsError;
      }
      
      if (metricsData && metricsData.length > 0) {
        // Update cache
        metricsCache = metricsData[0];
        lastFetchTime = now;
        
        setData(metricsData[0]);
        setLastUpdated(new Date());
        setIsUsingDemoData(false);
        return metricsData[0];
      }
      
      // If no data, try to calculate metrics from raw data
      const calculatedMetrics = await calculateMetricsFromRawData();
      metricsCache = calculatedMetrics;
      lastFetchTime = now;
      
      setData(calculatedMetrics);
      setLastUpdated(new Date());
      return calculatedMetrics;
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load metrics data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Fallback calculation if metrics summary table is empty
  const calculateMetricsFromRawData = async () => {
    try {
      // Get calls data
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*');
        
      if (callsError) {
        throw callsError;
      }
      
      // If no calls data, return mock metrics
      if (!callsData || callsData.length === 0) {
        setIsUsingDemoData(true);
        return getMockMetrics();
      }
      
      // Calculate basic metrics
      const totalCalls = callsData.length;
      const sumDuration = callsData.reduce((sum, call) => sum + (call.duration || 0), 0);
      const avgDuration = totalCalls > 0 ? sumDuration / totalCalls : 0;
      
      // Count sentiment categories
      const sentimentCounts = callsData.reduce(
        (counts, call) => {
          const sentiment = call.sentiment_agent || 0.5;
          if (sentiment >= 0.66) counts.positive++;
          else if (sentiment <= 0.33) counts.negative++;
          else counts.neutral++;
          return counts;
        },
        { positive: 0, neutral: 0, negative: 0 }
      );
      
      // Return calculated metrics
      return {
        total_calls: totalCalls,
        avg_duration: avgDuration,
        positive_sentiment_count: sentimentCounts.positive,
        neutral_sentiment_count: sentimentCounts.neutral,
        negative_sentiment_count: sentimentCounts.negative,
        avg_sentiment: callsData.reduce((sum, call) => sum + (call.sentiment_agent || 0.5), 0) / totalCalls,
        performance_score: 70, // Default performance score
        report_date: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating metrics from raw data:', error);
      setIsUsingDemoData(true);
      return getMockMetrics();
    }
  };

  // Get mock metrics data for demo/development
  const getMockMetrics = () => {
    setIsUsingDemoData(true);
    return {
      total_calls: 324,
      avg_duration: 270, // 4.5 minutes in seconds
      positive_sentiment_count: 182,
      neutral_sentiment_count: 91,
      negative_sentiment_count: 51,
      avg_sentiment: 0.72,
      conversion_rate: 0.48,
      agent_talk_ratio: 55,
      customer_talk_ratio: 45,
      top_keywords: ["pricing", "features", "support", "integration", "trial"],
      performance_score: 75,
      report_date: new Date().toISOString()
    };
  };

  return {
    data,
    isLoading,
    error,
    isUsingDemoData,
    lastUpdated,
    refresh: fetchMetrics
  };
};
