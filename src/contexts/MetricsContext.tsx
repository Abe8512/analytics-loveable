
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fixCallSentiments } from '@/utils/fixCallSentiments';
import { MetricsData, RawMetricsRecord, FormattedMetrics, initialMetricsData } from '@/types/metrics';
import { processMetricsData } from '@/utils/metricsProcessor';
import { useMetricsFetcher, clearMetricsCache } from '@/hooks/useMetricsFetcher';
import { useSharedFilters } from '@/contexts/SharedFilterContext';

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

export const useMetrics = () => useContext(MetricsContext);

interface MetricsProviderProps {
  children: React.ReactNode;
}

export const MetricsProvider: React.FC<MetricsProviderProps> = ({ children }) => {
  const { filters } = useSharedFilters();
  const { toast } = useToast();
  
  // Use our enhanced metrics fetcher with caching
  const {
    data: rawMetrics,
    isLoading,
    isError,
    error: fetchError,
    isUsingDemoData,
    refresh: refreshRawMetrics,
    lastUpdated
  } = useMetricsFetcher({
    cacheKey: 'dashboard-metrics',
    cacheDuration: 2 * 60 * 1000, // 2 minutes
    filters: {
      dateRange: filters.dateRange
    }
  });
  
  // Process the raw metrics data into the format needed by components
  const [processedData, setProcessedData] = useState<{
    metricsData: MetricsData;
    formattedMetrics: FormattedMetrics | null;
  }>({
    metricsData: initialMetricsData,
    formattedMetrics: null
  });
  
  // Update processed data when raw metrics change
  useEffect(() => {
    const { metricsData, formattedMetrics } = processMetricsData(
      rawMetrics,
      isLoading,
      isError
    );
    
    setProcessedData({
      metricsData: {
        ...metricsData,
        isUsingDemoData,
        lastUpdated: lastUpdated || metricsData.lastUpdated
      },
      formattedMetrics
    });
  }, [rawMetrics, isLoading, isError, isUsingDemoData, lastUpdated]);
  
  // Handle filter changes by refreshing data
  useEffect(() => {
    const refreshData = async () => {
      // Clear cache when filters change
      clearMetricsCache();
      await refreshRawMetrics(true);
    };
    
    refreshData();
  }, [filters, refreshRawMetrics]);
  
  // Function to fix sentiments and refresh data
  const fixSentiments = useCallback(async () => {
    try {
      const result = await fixCallSentiments();
      
      if (result.success) {
        toast({
          title: "Sentiment Update Complete",
          description: `Updated ${result.updated} of ${result.total} calls`
        });
        
        // Refresh metrics after fixing sentiments
        await refreshRawMetrics(true);
      } else {
        toast({
          title: "Sentiment Update Failed",
          description: result.error || "Could not update call sentiments",
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
    }
  }, [toast, refreshRawMetrics]);
  
  // Prepare context value
  const contextValue: MetricsContextValue = {
    rawMetrics,
    metricsData: processedData.metricsData,
    formattedMetrics: processedData.formattedMetrics,
    isLoading,
    isUsingDemoData,
    refresh: refreshRawMetrics,
    fixSentiments,
    error: fetchError
  };
  
  return (
    <MetricsContext.Provider value={contextValue}>
      {children}
    </MetricsContext.Provider>
  );
};
