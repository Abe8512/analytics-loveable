
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fixCallSentiments } from '@/utils/fixCallSentiments';
import { MetricsData, RawMetricsRecord, FormattedMetrics, initialMetricsData } from '@/types/metrics';
import { processMetricsData } from '@/utils/metricsProcessor';
import { getMetricsData } from '@/utils/metricsUtils';

interface MetricsContextValue {
  rawMetrics: RawMetricsRecord | null;
  metricsData: MetricsData;
  formattedMetrics: FormattedMetrics | null;
  isLoading: boolean;
  isUsingDemoData: boolean;
  refresh: () => Promise<void>;
  fixSentiments: () => Promise<void>;
  error: string | null;
}

const MetricsContext = createContext<MetricsContextValue>({
  rawMetrics: null,
  metricsData: initialMetricsData,
  formattedMetrics: null,
  isLoading: true,
  isUsingDemoData: false,
  refresh: async () => {},
  fixSentiments: async () => {},
  error: null
});

/**
 * Hook to access metrics data and functions
 */
export const useMetrics = () => useContext(MetricsContext);

/**
 * Provider component that makes metrics data available throughout the application
 */
export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawMetrics, setRawMetrics] = useState<RawMetricsRecord | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData>(initialMetricsData);
  const [formattedMetrics, setFormattedMetrics] = useState<FormattedMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  /**
   * Fetches the latest metrics data
   */
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get metrics data from API or database
      const latestMetrics = await getMetricsData(7);
      
      if (latestMetrics && latestMetrics.length > 0) {
        const latestMetricsRecord = latestMetrics[0];
        setRawMetrics(latestMetricsRecord);
        
        // Process raw metrics into consistent format
        const { metricsData: processedData, formattedMetrics: formatted, isUsingDemoData: usingDemo } = 
          processMetricsData(latestMetricsRecord, false, false);
        
        setMetricsData(processedData);
        setFormattedMetrics(formatted);
        setIsUsingDemoData(usingDemo);
      } else {
        console.warn('No metrics data available');
        setRawMetrics(null);
        
        // Process with null data to get demo data
        const { metricsData: demoData, formattedMetrics: demoFormatted, isUsingDemoData: usingDemo } = 
          processMetricsData(null, false, true);
        
        setMetricsData(demoData);
        setFormattedMetrics(demoFormatted);
        setIsUsingDemoData(usingDemo);
        setError('No metrics data available');
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching metrics');
      
      // Fallback to demo data in case of error
      const { metricsData: demoData, formattedMetrics: demoFormatted } = 
        processMetricsData(null, false, true);
      
      setMetricsData(demoData);
      setFormattedMetrics(demoFormatted);
      setIsUsingDemoData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Refreshes metrics data and shows a toast notification
   */
  const refresh = async () => {
    setIsLoading(true);
    await fetchMetrics();
    
    toast({
      title: "Metrics Refreshed",
      description: isUsingDemoData 
        ? "Using demo data (no real metrics found)" 
        : "Latest metrics data has been loaded"
    });
  };
  
  /**
   * Fixes neutral sentiment values and refreshes metrics
   */
  const fixSentiments = async () => {
    setIsUpdating(true);
    
    try {
      const result = await fixCallSentiments();
      
      if (result.success) {
        toast({
          title: "Sentiment Update Complete",
          description: `Updated ${result.updated} of ${result.total} calls. Failed: ${result.failed}`,
          variant: result.failed > 0 ? "destructive" : "default"
        });
        
        // Refresh metrics after updating sentiments
        await fetchMetrics();
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Could not update sentiments",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error fixing sentiments:', err);
      toast({
        title: "Error",
        description: "Failed to update call sentiments",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
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
  }, [fetchMetrics]);
  
  const contextValue = {
    rawMetrics,
    metricsData,
    formattedMetrics,
    isLoading,
    isUsingDemoData,
    refresh,
    fixSentiments,
    error
  };
  
  return (
    <MetricsContext.Provider value={contextValue}>
      {children}
    </MetricsContext.Provider>
  );
};
