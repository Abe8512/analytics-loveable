import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSharedFilters } from './SharedFilterContext';
import { useMetricsFetcher } from '@/hooks/useMetricsFetcher';
import { FormattedMetrics, MetricsFilters } from '@/types/metrics';
import { formatMetricsForDisplay, createEmptyFormattedMetrics } from '@/utils/metricsFormatter';
import { toast } from 'sonner';

// Context interface
interface MetricsContextType {
  metricsData: FormattedMetrics;
  rawMetricsData: any | null;
  isLoading: boolean;
  error: string | null;
  isUsingDemoData: boolean;
  lastUpdated: Date | null;
  refresh: (forceRefresh?: boolean) => Promise<void>;
  isRefreshing: boolean;
}

// Default context values
const defaultContext: MetricsContextType = {
  metricsData: createEmptyFormattedMetrics(),
  rawMetricsData: null,
  isLoading: true,
  error: null,
  isUsingDemoData: false,
  lastUpdated: null,
  refresh: async () => {},
  isRefreshing: false,
};

// Create context
const MetricsContext = createContext<MetricsContextType>(defaultContext);

// Provider component
export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { filters } = useSharedFilters();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use the metrics fetcher hook with appropriate caching settings
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    isUsingDemoData, 
    refresh: fetchMetrics,
    lastUpdated
  } = useMetricsFetcher({
    filters,
    cacheDuration: 5 * 60 * 1000, // 5 minutes cache
    shouldSubscribe: true,
  });

  // Format the raw metrics data for display using memoization to prevent unnecessary recalculations
  const formattedMetrics = useMemo(() => {
    return data ? formatMetricsForDisplay(data) : createEmptyFormattedMetrics();
  }, [data]);

  // Improved refresh function with better error handling and user feedback
  const refresh = useCallback(async (forceRefresh: boolean = false) => {
    if (isRefreshing) return; // Prevent concurrent refreshes
    
    try {
      setIsRefreshing(true);
      
      // Only show toast for manual refreshes
      if (forceRefresh) {
        toast.loading("Refreshing metrics data...");
      }
      
      await fetchMetrics(forceRefresh);
      
      if (forceRefresh) {
        toast.success("Metrics data refreshed successfully");
      }
    } catch (err) {
      console.error("Error refreshing metrics:", err);
      
      if (forceRefresh) {
        toast.error("Failed to refresh metrics data");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchMetrics, isRefreshing]);

  // Create the context value
  const contextValue = useMemo(() => ({
    metricsData: formattedMetrics,
    rawMetricsData: data,
    isLoading,
    error: isError ? error : null,
    isUsingDemoData,
    lastUpdated,
    refresh,
    isRefreshing,
  }), [formattedMetrics, data, isLoading, isError, error, isUsingDemoData, lastUpdated, refresh, isRefreshing]);

  return (
    <MetricsContext.Provider value={contextValue}>
      {children}
    </MetricsContext.Provider>
  );
};

// Custom hook to use the metrics context
export const useMetrics = () => useContext(MetricsContext);
