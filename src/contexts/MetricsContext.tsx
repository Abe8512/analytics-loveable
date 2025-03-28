
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  RawMetricsRecord, 
  FormattedMetrics, 
  TeamMetricsData, 
  RepMetricsData,
  MetricsFilters
} from '@/types/metrics';
import { formatMetricsForDisplay, createDemoMetricsData } from '@/utils/metricsProcessor';
import { useToast } from '@/hooks/use-toast';

interface MetricsContextType {
  rawMetrics: RawMetricsRecord | null;
  formattedMetrics: FormattedMetrics | null;
  teamMetrics: TeamMetricsData | null;
  repMetrics: RepMetricsData[];
  isLoading: boolean;
  error: Error | null;
  isUsingDemoData: boolean;
  refresh: (filters?: MetricsFilters) => Promise<void>;
  setFilters: (filters: MetricsFilters) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [rawMetrics, setRawMetrics] = useState<RawMetricsRecord | null>(null);
  const [formattedMetrics, setFormattedMetrics] = useState<FormattedMetrics | null>(null);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetricsData | null>(null);
  const [repMetrics, setRepMetrics] = useState<RepMetricsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const [filters, setFilters] = useState<MetricsFilters>({});
  const { toast } = useToast();

  const fetchMetricsData = async (currentFilters?: MetricsFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filtersToUse = currentFilters || filters;
      console.log('Fetching metrics with filters:', filtersToUse);
      
      let query = supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false });
      
      // Apply date range filter if provided
      if (filtersToUse?.dateRange?.from && filtersToUse?.dateRange?.to) {
        const fromDate = filtersToUse.dateRange.from.toISOString().split('T')[0];
        const toDate = filtersToUse.dateRange.to.toISOString().split('T')[0];
        
        query = query
          .gte('report_date', fromDate)
          .lte('report_date', toDate);
      }
      
      const { data, error } = await query.limit(1);
      
      if (error) {
        throw new Error(`Error fetching metrics: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        console.log('No metrics data found, using demo data');
        const demoData = createDemoMetricsData()[0];
        setRawMetrics(demoData);
        setFormattedMetrics(formatMetricsForDisplay(demoData));
        setIsUsingDemoData(true);
        
        // Also fetch demo rep data
        fetchRepMetricsData(filtersToUse, true);
        
        return;
      }
      
      const metrics = data[0] as RawMetricsRecord;
      setRawMetrics(metrics);
      setFormattedMetrics(formatMetricsForDisplay(metrics));
      setIsUsingDemoData(false);
      
      // Process team metrics
      setTeamMetrics({
        performanceScore: metrics.performance_score || 75,
        totalCalls: metrics.total_calls || 0,
        conversionRate: metrics.conversion_rate || 0,
        avgSentiment: metrics.avg_sentiment || 0.5,
        topKeywords: metrics.top_keywords || [],
        avgTalkRatio: {
          agent: metrics.agent_talk_ratio || 50,
          customer: metrics.customer_talk_ratio || 50
        }
      });
      
      // Fetch rep metrics
      fetchRepMetricsData(filtersToUse);
      
    } catch (err) {
      console.error('Error in fetchMetricsData:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Use demo data as fallback
      const demoData = createDemoMetricsData()[0];
      setRawMetrics(demoData);
      setFormattedMetrics(formatMetricsForDisplay(demoData));
      setIsUsingDemoData(true);
      
      // Also fetch demo rep data
      fetchRepMetricsData(filters, true);
      
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRepMetricsData = async (currentFilters?: MetricsFilters, useDemoData = false) => {
    try {
      const filtersToUse = currentFilters || filters;
      
      if (useDemoData) {
        // Generate demo rep data
        const demoReps: RepMetricsData[] = [
          {
            id: 'rep-1',
            name: 'Sarah Johnson',
            callVolume: 35,
            successRate: 0.78,
            sentiment: 0.85,
            insights: ['High conversion rate', 'Excellent customer rapport']
          },
          {
            id: 'rep-2',
            name: 'Michael Rodriguez',
            callVolume: 28,
            successRate: 0.65,
            sentiment: 0.72,
            insights: ['Good product knowledge', 'Needs improvement in objection handling']
          },
          {
            id: 'rep-3',
            name: 'Emily Chen',
            callVolume: 32,
            successRate: 0.71,
            sentiment: 0.79,
            insights: ['Consistent performance', 'Effective at follow-ups']
          },
          {
            id: 'rep-4',
            name: 'David Wilson',
            callVolume: 24,
            successRate: 0.58,
            sentiment: 0.68,
            insights: ['Improving steadily', 'Needs coaching on closing techniques']
          },
          {
            id: 'rep-5',
            name: 'Amanda Taylor',
            callVolume: 30,
            successRate: 0.73,
            sentiment: 0.81,
            insights: ['Strong customer relationships', 'Good at uncovering needs']
          },
        ];
        
        setRepMetrics(demoReps);
        return;
      }
      
      // Fetch real data from database
      let query = supabase
        .from('rep_metrics_summary')
        .select('*')
        .order('call_volume', { ascending: false });
      
      // Apply rep filter if provided
      if (filtersToUse?.repIds && filtersToUse.repIds.length > 0) {
        query = query.in('rep_id', filtersToUse.repIds);
      }
      
      const { data, error } = await query.limit(10);
      
      if (error) {
        throw new Error(`Error fetching rep metrics: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error('No rep metrics data found');
      }
      
      // Transform to RepMetricsData format
      const reps: RepMetricsData[] = data.map(rep => ({
        id: rep.rep_id,
        name: rep.rep_name || 'Unknown Rep',
        callVolume: rep.call_volume || 0,
        successRate: rep.success_rate || 0,
        sentiment: rep.sentiment_score || 0.5,
        insights: rep.insights || []
      }));
      
      setRepMetrics(reps);
      
    } catch (err) {
      console.error('Error in fetchRepMetricsData:', err);
      // Fallback to demo data when error
      fetchRepMetricsData(filters, true);
    }
  };

  // Subscribe to real-time updates for metrics
  useEffect(() => {
    const subscribeToUpdates = () => {
      const subscription = supabase
        .channel('metrics-updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'call_metrics_summary' }, 
          (payload) => {
            console.log('Received real-time metrics update:', payload);
            if (payload.new) {
              const updatedMetrics = payload.new as RawMetricsRecord;
              setRawMetrics(updatedMetrics);
              setFormattedMetrics(formatMetricsForDisplay(updatedMetrics));
              setIsUsingDemoData(false);
              
              toast({
                title: "Metrics Updated",
                description: "Call metrics data has been updated in real-time.",
              });
            }
          })
        .subscribe();

      return subscription;
    };
    
    const subscription = subscribeToUpdates();
    
    // Fetch initial data
    fetchMetricsData();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  
  // Refresh when filters change
  useEffect(() => {
    fetchMetricsData(filters);
  }, [filters]);

  return (
    <MetricsContext.Provider 
      value={{
        rawMetrics,
        formattedMetrics,
        teamMetrics,
        repMetrics,
        isLoading,
        error,
        isUsingDemoData,
        refresh: fetchMetricsData,
        setFilters
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};
