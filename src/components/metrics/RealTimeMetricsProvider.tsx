
import React, { createContext, useContext, ReactNode } from 'react';
import { useMetrics } from '@/contexts/MetricsContext';
import { MetricsFilters } from '@/types/metrics';

interface MetricsContextValue {
  metrics: {
    totalCalls: number;
    avgDuration: number | string;
    avgDurationMinutes?: number;
    positiveSentiment: number;
    callScore: number;
    conversionRate: number;
    isLoading: boolean;
    isUsingDemoData: boolean;
  };
  isUpdating: boolean;
  filters: MetricsFilters;
  setFilters: (filters: MetricsFilters) => void;
  refreshMetrics: () => Promise<void>;
}

const RealTimeMetricsContext = createContext<MetricsContextValue | undefined>(undefined);

export const RealTimeMetricsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { 
    formattedMetrics, 
    isLoading, 
    isUsingDemoData, 
    refresh,
    setFilters: updateFilters,
    error
  } = useMetrics();
  
  // Convert formattedMetrics to the format expected by consumers
  const metrics = {
    totalCalls: formattedMetrics?.totalCalls || 0,
    avgDuration: formattedMetrics?.avgDuration || '0:00',
    avgDurationMinutes: formattedMetrics?.avgDurationMinutes || 0,
    positiveSentiment: formattedMetrics?.positiveSentimentPercent || 0,
    callScore: formattedMetrics?.callScore || 0,
    conversionRate: formattedMetrics?.conversionRate || 0,
    isLoading,
    isUsingDemoData,
  };

  // Log error if present
  if (error) {
    console.error('Error in RealTimeMetricsProvider:', error);
  }

  return (
    <RealTimeMetricsContext.Provider 
      value={{
        metrics,
        isUpdating: isLoading,
        filters: {},
        setFilters: updateFilters,
        refreshMetrics: refresh
      }}
    >
      {children}
    </RealTimeMetricsContext.Provider>
  );
};

export const useMetrics = () => {
  const context = useContext(RealTimeMetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a RealTimeMetricsProvider');
  }
  return context;
};
