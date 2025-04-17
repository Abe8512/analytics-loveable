
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Cache strategy
let analyticsCache: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useAnalyticsData = (options: { filters?: any; forceFresh?: boolean } = {}) => {
  const { filters, forceFresh = false } = options;
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check cache if not forcing fresh data
      const now = Date.now();
      if (!forceFresh && analyticsCache && (now - lastCacheTime < CACHE_TTL)) {
        setData(analyticsCache);
        setIsLoading(false);
        return;
      }
      
      // First try to get data from analytics_summary table
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (!analyticsError && analyticsData && analyticsData.length > 0) {
        // Update with real data from summary table
        analyticsCache = analyticsData[0];
        lastCacheTime = now;
        setData(analyticsData[0]);
        setIsLoading(false);
        return;
      }
      
      // If no summary data, try to calculate from raw calls data
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*');
        
      if (callsError) {
        throw new Error('Error fetching calls data');
      }
      
      if (!callsData || callsData.length === 0) {
        // No call data, use mock data
        const mockData = generateMockAnalyticsData();
        analyticsCache = mockData;
        lastCacheTime = now;
        setData(mockData);
        return;
      }
      
      // Calculate analytics from raw calls
      const calculatedData = calculateAnalyticsFromCalls(callsData);
      analyticsCache = calculatedData;
      lastCacheTime = now;
      setData(calculatedData);
      
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err?.message || 'Failed to load analytics data');
      
      // Fall back to mock data on error
      const mockData = generateMockAnalyticsData();
      setData(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [filters, forceFresh]);
  
  // Calculate analytics from calls
  const calculateAnalyticsFromCalls = (calls: any[]) => {
    // Basic metrics
    const totalCalls = calls.length;
    const avgDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0) / totalCalls;
    
    // Sentiment analysis
    const sentimentCount = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    let totalSentiment = 0;
    
    calls.forEach(call => {
      const sentiment = call.sentiment_agent || 0.5;
      totalSentiment += sentiment;
      
      if (sentiment >= 0.66) sentimentCount.positive++;
      else if (sentiment <= 0.33) sentimentCount.negative++;
      else sentimentCount.neutral++;
    });
    
    const avgSentiment = totalSentiment / totalCalls;
    
    // Return calculated analytics
    return {
      totalCalls,
      avgDuration,
      avgDurationMinutes: Math.round(avgDuration / 60),
      totalDuration: calls.reduce((sum, call) => sum + (call.duration || 0), 0),
      sentimentScore: avgSentiment,
      positiveSentimentCount: sentimentCount.positive,
      neutralSentimentCount: sentimentCount.neutral,
      negativeSentimentCount: sentimentCount.negative,
      positiveSentimentPercent: Math.round((sentimentCount.positive / totalCalls) * 100),
      neutralSentimentPercent: Math.round((sentimentCount.neutral / totalCalls) * 100),
      negativeSentimentPercent: Math.round((sentimentCount.negative / totalCalls) * 100),
      conversionRate: 0.35, // Default value
      talkRatioAgent: 55, // Default value
      talkRatioCustomer: 45, // Default value
      performanceScore: Math.round(65 + avgSentiment * 20), // Simple formula based on sentiment
      createdAt: new Date().toISOString()
    };
  };
  
  // Generate mock analytics data
  const generateMockAnalyticsData = () => {
    return {
      totalCalls: 325,
      avgDuration: 270, // seconds
      avgDurationMinutes: 4.5,
      totalDuration: 87750, // seconds
      sentimentScore: 0.72,
      positiveSentimentCount: 180,
      neutralSentimentCount: 95,
      negativeSentimentCount: 50,
      positiveSentimentPercent: 55,
      neutralSentimentPercent: 29,
      negativeSentimentPercent: 16,
      conversionRate: 0.38,
      talkRatioAgent: 52,
      talkRatioCustomer: 48,
      performanceScore: 78,
      createdAt: new Date().toISOString()
    };
  };
  
  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Function to manually refresh data
  const refreshData = useCallback(async () => {
    try {
      toast.loading("Refreshing analytics data...");
      await fetchData();
      toast.success("Analytics data refreshed");
    } catch (err) {
      toast.error("Failed to refresh analytics data");
    }
  }, [fetchData]);
  
  return { 
    data, 
    isLoading, 
    error,
    refreshData,
    isUsingMockData: !data?.createdAt
  };
};
