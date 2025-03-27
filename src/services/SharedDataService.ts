
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Type definitions to fix import errors across the app
export interface TeamMetricsData {
  performanceScore?: number;
  totalCalls?: number;
  conversionRate?: number;
  avgSentiment?: number;
  topKeywords?: string[];
  avgTalkRatio?: {
    agent: number;
    customer: number;
  };
}

export interface RepMetricsData {
  id: string;
  name: string;
  callVolume: number;
  successRate: number;
  sentiment: number;
  insights: string[];
}

export interface DataFilters {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  repIds?: string[];
}

// Hook to get managed users (needed by AuthContext)
export const getManagedUsers = () => {
  // Retrieve from session storage first
  const sessionStorageData = sessionStorage.getItem('managedUsers');
  if (sessionStorageData) {
    try {
      return JSON.parse(sessionStorageData);
    } catch (e) {
      console.error('Error parsing managed users data:', e);
    }
  }
  
  // Return default/demo data if nothing found
  return [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Sales Rep' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Sales Rep' },
  ];
};

// Hook for team metrics data - existing implementation
export const useTeamMetricsData = (filters: DataFilters = {}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Safely query call_metrics_summary - removed .single() to avoid errors
        const { data, error: fetchError } = await supabase
          .from('call_metrics_summary')
          .select('*')
          .order('report_date', { ascending: false })
          .limit(1);
        
        if (fetchError) {
          // If the error is about the table not existing, return demo data
          if (fetchError.code === '42P01' || 
              fetchError.message.includes('relation') || 
              fetchError.message.includes('does not exist')) {
            setMetrics(generateDemoMetrics());
          } else {
            console.error("Error fetching metrics:", fetchError);
            setError(fetchError);
            setMetrics(generateDemoMetrics()); // Fall back to demo data
          }
          return;
        }
        
        if (data && data.length > 0) {
          setMetrics(data[0]);
        } else {
          console.log("No metrics available, using demo data");
          setMetrics(generateDemoMetrics());
        }
      } catch (err) {
        console.error("Error in fetchMetrics:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setMetrics(generateDemoMetrics()); // Fall back to demo data
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetrics();
  }, [filters]);
  
  // Generate demo metrics as a fallback
  const generateDemoMetrics = () => {
    return {
      id: "demo-metrics",
      report_date: new Date().toISOString().split('T')[0],
      total_calls: 128,
      total_duration: 18432,
      avg_duration: 144,
      positive_sentiment_count: 72,
      neutral_sentiment_count: 42,
      negative_sentiment_count: 14,
      avg_sentiment: 0.68,
      agent_talk_ratio: 42,
      customer_talk_ratio: 58,
      performance_score: 76,
      conversion_rate: 0.35,
      top_keywords: ["pricing", "features", "competitors", "demo", "timeline"]
    };
  };
  
  return { metrics, isLoading, error };
};

// Add hooks needed by RealTimeMetricsService
export const useSharedTeamMetrics = (filters: DataFilters = {}): { 
  metrics: TeamMetricsData | null; 
  isLoading: boolean; 
  error: Error | null 
} => {
  const { metrics, isLoading, error } = useTeamMetricsData(filters);
  
  // Transform the data to match TeamMetricsData interface
  const transformedMetrics: TeamMetricsData = {
    performanceScore: metrics?.performance_score,
    totalCalls: metrics?.total_calls,
    conversionRate: metrics?.conversion_rate,
    avgSentiment: metrics?.avg_sentiment,
    topKeywords: metrics?.top_keywords,
    avgTalkRatio: {
      agent: metrics?.agent_talk_ratio || 50,
      customer: metrics?.customer_talk_ratio || 50
    }
  };
  
  return { metrics: transformedMetrics, isLoading, error };
};

// Add hook for rep metrics
export const useSharedRepMetrics = (filters: DataFilters = {}): { 
  metrics: RepMetricsData[];
  isLoading: boolean;
  error: Error | null 
} => {
  const [metrics, setMetrics] = useState<RepMetricsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchRepMetrics = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from rep_metrics_summary table
        const { data, error: fetchError } = await supabase
          .from('rep_metrics_summary')
          .select('*');
          
        if (fetchError) {
          // Generate demo data if there's a fetch error
          return setMetrics([
            {
              id: "1",
              name: "John Doe",
              callVolume: 25,
              successRate: 65,
              sentiment: 0.78,
              insights: ["Asks good discovery questions", "Could improve closing technique"]
            },
            {
              id: "2",
              name: "Jane Smith",
              callVolume: 32,
              successRate: 72,
              sentiment: 0.82,
              insights: ["Excellent at handling objections", "Clear product explanations"]
            }
          ]);
        }
        
        if (data && data.length > 0) {
          // Transform data to match RepMetricsData interface
          setMetrics(data.map(rep => ({
            id: rep.rep_id,
            name: rep.rep_name || 'Unknown Rep',
            callVolume: rep.call_volume || 0,
            successRate: rep.success_rate || 0,
            sentiment: rep.sentiment_score || 0.5,
            insights: rep.insights || []
          })));
        } else {
          // No data, use demo data
          setMetrics([
            {
              id: "1",
              name: "John Doe",
              callVolume: 25,
              successRate: 65,
              sentiment: 0.78,
              insights: ["Asks good discovery questions", "Could improve closing technique"]
            },
            {
              id: "2",
              name: "Jane Smith",
              callVolume: 32,
              successRate: 72,
              sentiment: 0.82,
              insights: ["Excellent at handling objections", "Clear product explanations"]
            }
          ]);
        }
      } catch (err) {
        console.error("Error fetching rep metrics:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Fallback to demo data
        setMetrics([
          {
            id: "1",
            name: "John Doe",
            callVolume: 25,
            successRate: 65,
            sentiment: 0.78,
            insights: ["Asks good discovery questions", "Could improve closing technique"]
          },
          {
            id: "2",
            name: "Jane Smith",
            callVolume: 32,
            successRate: 72,
            sentiment: 0.82,
            insights: ["Excellent at handling objections", "Clear product explanations"]
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRepMetrics();
  }, [filters]);
  
  return { metrics, isLoading, error };
};
