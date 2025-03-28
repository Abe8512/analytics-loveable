
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSharedFilters } from './SharedFilterContext';
import { useMetricsFetcher } from '@/hooks/useMetricsFetcher';
import { RawMetricsRecord, FormattedMetrics } from '@/types/metrics';
import { formatMetricsForDisplay } from '@/utils/metricsUtils';

// Default formatted metrics data structure
const defaultFormattedMetrics: FormattedMetrics = {
  totalCalls: 0,
  avgDuration: "0:00", // Changed from number to string to match FormattedMetrics type
  avgDurationSeconds: 0,
  avgDurationMinutes: 0,
  totalDuration: 0,
  positiveCallsCount: 0,
  negativeCallsCount: 0,
  neutralCallsCount: 0,
  positiveSentimentPercent: 0,
  negativeSentimentPercent: 0,
  neutralSentimentPercent: 0,
  avgSentiment: 0,
  avgSentimentPercent: 0,
  callScore: 0,
  conversionRate: 0,
  agentTalkRatio: 0,
  customerTalkRatio: 0,
  topKeywords: [],
  reportDate: new Date().toISOString().split('T')[0]
};

// Context interface
interface MetricsContextType {
  metricsData: FormattedMetrics;
  rawMetricsData: RawMetricsRecord | null;
  isLoading: boolean;
  error: string | null;
  isUsingDemoData: boolean;
  lastUpdated: Date | null;
  refresh: (forceRefresh?: boolean) => Promise<void>;
}

// Default context values
const defaultContext: MetricsContextType = {
  metricsData: defaultFormattedMetrics,
  rawMetricsData: null,
  isLoading: true,
  error: null,
  isUsingDemoData: false,
  lastUpdated: null,
  refresh: async () => {},
};

// Create context
const MetricsContext = createContext<MetricsContextType>(defaultContext);

// Provider component
export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { filters } = useSharedFilters();

  // Use the metrics fetcher hook
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    isUsingDemoData, 
    refresh,
    lastUpdated
  } = useMetricsFetcher({
    filters,
    cacheDuration: 5 * 60 * 1000, // 5 minutes cache
    shouldSubscribe: true,
  });

  // Format the raw metrics data for display
  const formattedMetrics = useMemo(() => {
    return data ? formatMetricsForDisplay(data) : defaultFormattedMetrics;
  }, [data]);

  // Create the context value
  const contextValue = useMemo(() => ({
    metricsData: formattedMetrics,
    rawMetricsData: data,
    isLoading,
    error: isError ? error : null,
    isUsingDemoData,
    lastUpdated,
    refresh,
  }), [formattedMetrics, data, isLoading, isError, error, isUsingDemoData, lastUpdated, refresh]);

  return (
    <MetricsContext.Provider value={contextValue}>
      {children}
    </MetricsContext.Provider>
  );
};

// Custom hook to use the metrics context
export const useMetrics = () => useContext(MetricsContext);
