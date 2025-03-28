
import React from 'react';
import { MetricsProvider } from '@/contexts/MetricsContext';
import { useMetrics } from '@/contexts/MetricsContext';

/**
 * Re-export useMetrics hook from the context
 * This maintains backward compatibility with existing components
 */
export { useMetrics };

/**
 * Provider component that fetches and maintains real-time metrics data
 * Makes metrics data available throughout the application
 */
export const RealTimeMetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MetricsProvider>{children}</MetricsProvider>;
};

export default RealTimeMetricsProvider;
