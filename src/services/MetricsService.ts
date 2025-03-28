
import { supabase } from '@/integrations/supabase/client';
import { 
  RawMetricsRecord, 
  FormattedMetrics, 
  MetricsData, 
  TeamMetricsData, 
  RepMetricsData, 
  MetricsFilters 
} from '@/types/metrics';
import { formatMetricsForDisplay } from '@/utils/metricsUtils';
import { useCallback, useEffect, useState } from 'react';
import { generateDemoCallMetrics, generateDemoRepMetricsData } from '@/services/DemoDataService';

/**
 * Service class for metrics-related operations
 */
export class MetricsService {
  /**
   * Fetches the latest metrics for the specified date range
   * @param filters Optional filters for the metrics query
   * @returns Promise with the fetched metrics
   */
  static async fetchMetrics(filters?: MetricsFilters): Promise<RawMetricsRecord | null> {
    try {
      console.log('Fetching metrics with filters:', filters);
      
      let query = supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false });
      
      // Apply date range filter if provided
      if (filters?.dateRange?.from && filters?.dateRange?.to) {
        const fromDate = filters.dateRange.from.toISOString().split('T')[0];
        const toDate = filters.dateRange.to.toISOString().split('T')[0];
        
        query = query
          .gte('report_date', fromDate)
          .lte('report_date', toDate);
      }
      
      const { data, error } = await query.limit(1);
      
      if (error) {
        console.error('Error fetching metrics:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.log('No metrics data found');
        return null;
      }
      
      return data[0] as RawMetricsRecord;
    } catch (err) {
      console.error('Exception in fetchMetrics:', err);
      return null;
    }
  }
  
  /**
   * Fetches rep metrics for the specified filters
   * @param filters Optional filters for the rep metrics query
   * @param limit Maximum number of records to return
   * @returns Promise with the fetched rep metrics
   */
  static async fetchRepMetrics(filters?: MetricsFilters, limit: number = 10): Promise<RepMetricsData[]> {
    try {
      console.log('Fetching rep metrics with filters:', filters);
      
      let query = supabase
        .from('rep_metrics_summary')
        .select('*')
        .order('call_volume', { ascending: false });
      
      // Apply rep filter if provided
      if (filters?.repIds && filters.repIds.length > 0) {
        query = query.in('rep_id', filters.repIds);
      }
      
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error('Error fetching rep metrics:', error);
        return generateDemoRepMetricsData(limit);
      }
      
      if (!data || data.length === 0) {
        console.log('No rep metrics data found');
        return generateDemoRepMetricsData(limit);
      }
      
      // Transform to RepMetricsData format
      return data.map(rep => ({
        id: rep.rep_id,
        name: rep.rep_name || 'Unknown Rep',
        callVolume: rep.call_volume || 0,
        successRate: rep.success_rate || 0,
        sentiment: rep.sentiment_score || 0.5,
        insights: rep.insights || []
      }));
    } catch (err) {
      console.error('Exception in fetchRepMetrics:', err);
      return generateDemoRepMetricsData(limit);
    }
  }
  
  /**
   * Fetches and formats team metrics data
   * @param filters Optional filters for the team metrics query
   * @returns Promise with the team metrics data
   */
  static async fetchTeamMetrics(filters?: MetricsFilters): Promise<TeamMetricsData | null> {
    const rawMetrics = await this.fetchMetrics(filters);
    
    if (!rawMetrics) {
      console.log('No team metrics available, returning null');
      return null;
    }
    
    return {
      performanceScore: rawMetrics.performance_score,
      totalCalls: rawMetrics.total_calls,
      conversionRate: rawMetrics.conversion_rate,
      avgSentiment: rawMetrics.avg_sentiment,
      topKeywords: rawMetrics.top_keywords,
      avgTalkRatio: {
        agent: rawMetrics.agent_talk_ratio || 50,
        customer: rawMetrics.customer_talk_ratio || 50
      }
    };
  }
  
  /**
   * Subscribes to real-time updates for metrics data
   * @param callback Function to call when metrics are updated
   * @returns Subscription object that can be used to unsubscribe
   */
  static subscribeToMetricsUpdates(callback: (metrics: RawMetricsRecord) => void) {
    return supabase
      .channel('metrics-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'call_metrics_summary' }, 
        payload => {
          console.log('Metrics data updated in database:', payload);
          callback(payload.new as RawMetricsRecord);
        })
      .subscribe();
  }
}

/**
 * Custom hook to access metrics data with filters
 * @param filters Optional filters for the metrics
 * @returns Object containing metrics data and loading state
 */
export const useMetricsData = (filters?: MetricsFilters) => {
  const [data, setData] = useState<FormattedMetrics | null>(null);
  const [rawData, setRawData] = useState<RawMetricsRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const metricsData = await MetricsService.fetchMetrics(filters);
      
      if (metricsData) {
        setRawData(metricsData);
        setData(formatMetricsForDisplay(metricsData));
      } else {
        console.log('No metrics data found, using demo data');
        const demoData = generateDemoCallMetrics()[0] as RawMetricsRecord;
        setRawData(demoData);
        setData(formatMetricsForDisplay(demoData));
      }
    } catch (err) {
      console.error('Error in useMetricsData:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Use demo data as fallback
      const demoData = generateDemoCallMetrics()[0] as RawMetricsRecord;
      setRawData(demoData);
      setData(formatMetricsForDisplay(demoData));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates
    const subscription = MetricsService.subscribeToMetricsUpdates((updatedMetrics: RawMetricsRecord) => {
      console.log('Received real-time metrics update:', updatedMetrics);
      setRawData(updatedMetrics);
      setData(formatMetricsForDisplay(updatedMetrics));
    });
    
    return () => {
      // Clean up subscription
      subscription.unsubscribe();
    };
  }, [fetchData]);
  
  return {
    data,
    rawData,
    isLoading,
    error,
    refresh: fetchData
  };
};

/**
 * Custom hook to access team metrics data
 * @param filters Optional filters for the team metrics
 * @returns Object containing team metrics data and loading state
 */
export const useTeamMetricsData = (filters?: MetricsFilters) => {
  const [metrics, setMetrics] = useState<TeamMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const teamMetricsData = await MetricsService.fetchTeamMetrics(filters);
      
      if (teamMetricsData) {
        setMetrics(teamMetricsData);
      } else {
        // Fall back to a default TeamMetricsData object
        setMetrics({
          performanceScore: 75,
          totalCalls: 0,
          conversionRate: 0,
          avgSentiment: 0.5,
          topKeywords: [],
          avgTalkRatio: {
            agent: 50,
            customer: 50
          }
        });
      }
    } catch (err) {
      console.error('Error in useTeamMetricsData:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fall back to a default TeamMetricsData object
      setMetrics({
        performanceScore: 75,
        totalCalls: 0,
        conversionRate: 0,
        avgSentiment: 0.5,
        topKeywords: [],
        avgTalkRatio: {
          agent: 50,
          customer: 50
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { metrics, isLoading, error, refresh: fetchData };
};

/**
 * Custom hook to access rep metrics data
 * @param filters Optional filters for the rep metrics
 * @param limit Maximum number of records to return
 * @returns Object containing rep metrics data and loading state
 */
export const useRepMetricsData = (filters?: MetricsFilters, limit: number = 10) => {
  const [metrics, setMetrics] = useState<RepMetricsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const repMetricsData = await MetricsService.fetchRepMetrics(filters, limit);
      setMetrics(repMetricsData);
    } catch (err) {
      console.error('Error in useRepMetricsData:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fall back to demo data
      setMetrics(generateDemoRepMetricsData(limit));
    } finally {
      setIsLoading(false);
    }
  }, [filters, limit]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { metrics, isLoading, error, refresh: fetchData };
};
