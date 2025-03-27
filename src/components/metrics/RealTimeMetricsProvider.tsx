
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MetricsData {
  // Call metrics
  totalCalls: number;
  avgDuration: number;
  positiveSentiment: number;
  negativeSentiment: number;
  neutralSentiment: number;
  avgSentiment: number;
  callScore: number;
  conversionRate: number;
  
  // Talk metrics
  agentTalkRatio: number;
  customerTalkRatio: number;
  
  // Keywords
  topKeywords: string[];
  
  // Time-based data
  lastUpdated: Date | null;
  reportDate: string;
  
  // Status
  isLoading: boolean;
  isUsingDemoData: boolean;
  lastError: string | null;
}

const initialMetricsData: MetricsData = {
  totalCalls: 0,
  avgDuration: 0,
  positiveSentiment: 0,
  negativeSentiment: 0,
  neutralSentiment: 0,
  avgSentiment: 0,
  callScore: 0,
  conversionRate: 0,
  agentTalkRatio: 50,
  customerTalkRatio: 50,
  topKeywords: [],
  lastUpdated: null,
  reportDate: new Date().toISOString().split('T')[0],
  isLoading: true,
  isUsingDemoData: false,
  lastError: null
};

const MetricsContext = createContext<{
  metrics: MetricsData;
  refreshMetrics: () => Promise<void>;
}>({
  metrics: initialMetricsData,
  refreshMetrics: async () => {}
});

export const useMetrics = () => useContext(MetricsContext);

export const RealTimeMetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<MetricsData>(initialMetricsData);
  const { toast } = useToast();
  
  const fetchMetrics = async () => {
    try {
      console.log('Fetching real-time metrics from Supabase...');
      setMetrics(prev => ({ ...prev, isLoading: true, lastError: null }));
      
      const { data, error } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching metrics:', error);
        setMetrics(prev => ({ 
          ...prev, 
          isLoading: false, 
          isUsingDemoData: true,
          lastError: error.message
        }));
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Successfully retrieved metrics:', data[0]);
        const metricsData = data[0];
        
        setMetrics({
          totalCalls: metricsData.total_calls || 0,
          avgDuration: metricsData.avg_duration || 0,
          positiveSentiment: metricsData.positive_sentiment_count || 0,
          negativeSentiment: metricsData.negative_sentiment_count || 0,
          neutralSentiment: metricsData.neutral_sentiment_count || 0,
          avgSentiment: metricsData.avg_sentiment || 0.5,
          callScore: metricsData.performance_score || 0,
          conversionRate: metricsData.conversion_rate ? metricsData.conversion_rate * 100 : 0,
          agentTalkRatio: metricsData.agent_talk_ratio || 50,
          customerTalkRatio: metricsData.customer_talk_ratio || 50,
          topKeywords: metricsData.top_keywords || [],
          reportDate: metricsData.report_date,
          lastUpdated: new Date(),
          isLoading: false,
          isUsingDemoData: false,
          lastError: null
        });
      } else {
        console.log('No metrics data found, using default/demo values');
        setMetrics(prev => ({ 
          ...prev, 
          isLoading: false, 
          isUsingDemoData: true,
          lastError: 'No metrics data found'
        }));
      }
    } catch (error) {
      console.error('Exception in fetchMetrics:', error);
      setMetrics(prev => ({ 
        ...prev, 
        isLoading: false, 
        isUsingDemoData: true,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };
  
  const refreshMetrics = async () => {
    await fetchMetrics();
    toast({
      title: "Metrics Refreshed",
      description: "Latest metrics data has been loaded"
    });
  };
  
  // Set up real-time subscription for metrics updates
  useEffect(() => {
    // Initial fetch
    fetchMetrics();
    
    // Subscribe to changes on the call_metrics_summary table
    const subscription = supabase
      .channel('metrics-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'call_metrics_summary' }, 
        () => {
          console.log('Metrics data updated in database, refreshing...');
          fetchMetrics();
        })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <MetricsContext.Provider value={{ metrics, refreshMetrics }}>
      {children}
    </MetricsContext.Provider>
  );
};

export default RealTimeMetricsProvider;
