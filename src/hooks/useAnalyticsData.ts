
import { useState, useEffect } from 'react';
import { MetricsFilters } from '@/types/metrics';
import { useMetrics } from '@/contexts/MetricsContext';

interface AnalyticsData {
  totalCalls: string;
  avgDuration: string;
  sentimentScore: string;
  conversionRate: string;
  positiveCallsPercent: number;
  neutralCallsPercent: number;
  negativeCallsPercent: number;
}

export const useAnalyticsData = (filters?: MetricsFilters) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { metricsData, isLoading: metricsLoading, error: metricsError } = useMetrics();
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Use metrics data from context if available
        if (metricsData) {
          // Format the data for display
          setData({
            totalCalls: metricsData.totalCalls.toString(),
            avgDuration: `${Math.floor(metricsData.avgDurationMinutes)}:${Math.floor(metricsData.avgDurationSeconds % 60).toString().padStart(2, '0')}`,
            sentimentScore: `${Math.round(metricsData.avgSentimentPercent)}/100`,
            conversionRate: `${Math.round(metricsData.conversionRate * 100)}%`,
            positiveCallsPercent: metricsData.positiveSentimentPercent,
            neutralCallsPercent: metricsData.neutralSentimentPercent,
            negativeCallsPercent: metricsData.negativeSentimentPercent
          });
        } else {
          // Fallback mock data if metrics aren't available
          setData({
            totalCalls: '324',
            avgDuration: '4:32',
            sentimentScore: '72/100',
            conversionRate: '48%',
            positiveCallsPercent: 56,
            neutralCallsPercent: 28,
            negativeCallsPercent: 16
          });
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if metrics are done loading or we have an error
    if (!metricsLoading || metricsError) {
      fetchAnalyticsData();
    }
  }, [metricsData, metricsLoading, metricsError, filters]);
  
  return { data, isLoading, error };
};
