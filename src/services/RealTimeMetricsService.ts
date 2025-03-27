
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from './ErrorHandlingService';
import { useToast } from '@/hooks/use-toast';
import { EventType, useEventsStore } from './events';

export interface TeamMetric {
  team_name: string;
  call_count: number;
  avg_sentiment: number;
  avg_duration: number;
  conversion_rate: number;
  success_rate: number;
  date?: string;
}

export interface RepMetric {
  rep_name: string;
  rep_id: string;
  call_count: number;
  avg_sentiment: number;
  avg_duration: number;
  conversion_rate: number;
  success_rate: number;
  top_keywords?: string[];
}

// Main hook that provides both team and rep metrics
export const useRealTimeMetrics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [repMetrics, setRepMetrics] = useState<RepMetric[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const { toast } = useToast();
  
  const checkTableExists = useCallback(async (tableName: string): Promise<boolean> => {
    try {
      // Check if table exists in the database
      const { data, error } = await supabase
        .from('schema_migrations')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('Error checking schema:', error);
        return false;
      }
      
      // Now specifically check for our table
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
        
      // If we get a specific error about the relation not existing, the table doesn't exist
      if (tableError && tableError.message.includes('does not exist')) {
        console.log(`Table ${tableName} does not exist`);
        return false;
      }
      
      return !tableError;
    } catch (err) {
      console.error(`Error checking if ${tableName} exists:`, err);
      return false;
    }
  }, []);
  
  const refreshTeamMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if call_metrics_summary table exists
      const callMetricsTableExists = await checkTableExists('call_metrics_summary');
      
      if (!callMetricsTableExists) {
        console.log('call_metrics_summary table does not exist, using demo data');
        // Return demo team metrics data
        setTeamMetrics([
          {
            team_name: 'Sales Team',
            call_count: 156,
            avg_sentiment: 0.72,
            avg_duration: 324,
            conversion_rate: 28,
            success_rate: 65,
            date: new Date().toISOString()
          }
        ]);
        setIsLoading(false);
        return;
      }
      
      // Fetch call metrics data from call_metrics_summary table
      const { data: callMetricsData, error: callMetricsError } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(30);
        
      if (callMetricsError) {
        console.error('Error fetching call metrics:', callMetricsError);
        throw callMetricsError;
      }
      
      // Map database records to TeamMetric interface
      const mappedTeamMetrics: TeamMetric[] = callMetricsData ? callMetricsData.map(record => ({
        team_name: 'Sales Team',
        call_count: record.total_calls || 0,
        avg_sentiment: record.avg_sentiment || 0.5,
        avg_duration: record.avg_duration || 0,
        conversion_rate: record.conversion_rate || 0,
        success_rate: record.performance_score || 50,
        date: record.report_date
      })) : [];
      
      setTeamMetrics(mappedTeamMetrics);
      setLastRefreshed(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error('Error refreshing team metrics:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      errorHandler.handleError(err, 'RealTimeMetricsService.refreshTeamMetrics');
    }
  }, [checkTableExists]);
  
  const refreshRepMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if rep_metrics_summary table exists
      const repMetricsTableExists = await checkTableExists('rep_metrics_summary');
      
      if (!repMetricsTableExists) {
        console.log('rep_metrics_summary table does not exist, using demo data');
        // Return demo rep metrics data
        setRepMetrics([
          {
            rep_name: 'Sarah Johnson',
            rep_id: 'user-1',
            call_count: 42,
            avg_sentiment: 0.78,
            avg_duration: 340,
            conversion_rate: 32,
            success_rate: 76,
            top_keywords: ['pricing', 'demo', 'features']
          },
          {
            rep_name: 'Michael Chen',
            rep_id: 'user-2',
            call_count: 38,
            avg_sentiment: 0.68,
            avg_duration: 290,
            conversion_rate: 24,
            success_rate: 62,
            top_keywords: ['support', 'integration', 'timeline']
          }
        ]);
        setIsLoading(false);
        return;
      }
      
      // Fetch rep metrics data
      const { data: repMetricsData, error: repMetricsError } = await supabase
        .from('rep_metrics_summary')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (repMetricsError) {
        console.error('Error fetching rep metrics:', repMetricsError);
        throw repMetricsError;
      }
      
      // Map database records to RepMetric interface
      const mappedRepMetrics: RepMetric[] = repMetricsData ? repMetricsData.map(record => ({
        rep_name: record.rep_name || `Rep ${record.rep_id.substring(0, 5)}`,
        rep_id: record.rep_id,
        call_count: record.call_volume || 0,
        avg_sentiment: record.sentiment_score || 0.5,
        avg_duration: 0, // Not available in the original data
        conversion_rate: 0, // Not available in the original data
        success_rate: record.success_rate || 0,
        top_keywords: record.top_keywords || []
      })) : [];
      
      setRepMetrics(mappedRepMetrics);
      setLastRefreshed(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error('Error refreshing rep metrics:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      errorHandler.handleError(err, 'RealTimeMetricsService.refreshRepMetrics');
    }
  }, [checkTableExists]);
  
  const setupRealtimeSubscription = useCallback(() => {
    console.log('Setting up realtime subscription for metrics...');
    
    // Subscribe to changes in call_metrics_summary table
    const channel = supabase
      .channel('metrics-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'call_metrics_summary'
      }, () => {
        console.log('Call metrics changed, refreshing data...');
        refreshTeamMetrics();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rep_metrics_summary'
      }, () => {
        console.log('Rep metrics changed, refreshing data...');
        refreshRepMetrics();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime metrics changes');
        } else {
          console.warn('Realtime subscription status:', status);
        }
      });
      
    // Cleanup function to remove the channel when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTeamMetrics, refreshRepMetrics]);
  
  // Initial fetch of data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          refreshTeamMetrics(),
          refreshRepMetrics()
        ]);
      } catch (err) {
        console.error('Error fetching initial metrics data:', err);
        toast({
          title: 'Error loading metrics',
          description: 'Failed to load performance metrics data',
          variant: 'destructive',
        });
      }
    };
    
    fetchInitialData();
    
    // Set up event listeners for metrics updates
    const unsubscribe = useEventsStore.subscribe((state) => {
      const unsub = state.addEventListener('calls-updated' as EventType, () => {
        console.log('Calls updated event received, refreshing metrics...');
        refreshTeamMetrics();
        refreshRepMetrics();
      });
      return unsub;
    });
    
    // Set up realtime subscription
    const unsubscribeRealtime = setupRealtimeSubscription();
    
    return () => {
      unsubscribe();
      unsubscribeRealtime();
    };
  }, [refreshTeamMetrics, refreshRepMetrics, setupRealtimeSubscription, toast]);
  
  // Function to manually refresh data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        refreshTeamMetrics(),
        refreshRepMetrics()
      ]);
      setLastRefreshed(new Date());
      setIsLoading(false);
      
      toast({
        title: 'Metrics Refreshed',
        description: 'Performance metrics have been updated',
      });
    } catch (err) {
      console.error('Error refreshing metrics data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      
      toast({
        title: 'Refresh Failed',
        description: 'Could not update performance metrics',
        variant: 'destructive',
      });
    }
  }, [refreshTeamMetrics, refreshRepMetrics, toast]);
  
  return {
    teamMetrics,
    repMetrics,
    isLoading,
    error,
    lastRefreshed,
    refreshData
  };
};

// Export separate hooks for components that only need team or rep metrics
export const useTeamMetrics = () => {
  const { teamMetrics, isLoading, error, refreshData } = useRealTimeMetrics();
  return { metrics: teamMetrics, isLoading, error, refresh: refreshData };
};

export const useRepMetrics = () => {
  const { repMetrics, isLoading, error, refreshData } = useRealTimeMetrics();
  return { metrics: repMetrics, isLoading, error, refresh: refreshData };
};
