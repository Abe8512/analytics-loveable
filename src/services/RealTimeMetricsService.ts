
import { useEffect, useMemo, useCallback } from "react";
import {
  useSharedTeamMetrics,
  useSharedRepMetrics,
  type TeamMetricsData as TeamMetrics,
  type RepMetricsData as RepMetrics,
  type DataFilters
} from "./SharedDataService";
import { validateMetricConsistency } from "@/utils/metricCalculations";
import { animationUtils } from "@/utils/animationUtils";
import { useStableLoadingState } from "@/hooks/useStableLoadingState";
import { errorHandler, withErrorHandling } from "./ErrorHandlingService";

// Re-export TeamMetrics and RepMetrics for backward compatibility
export type { TeamMetrics, RepMetrics };

// Default metrics to use when data is loading or unavailable
const DEFAULT_TEAM_METRICS: TeamMetrics = {
  performanceScore: 75,
  totalCalls: 42,
  conversionRate: 28,
  avgSentiment: 0.68,
  topKeywords: ["pricing", "features", "support"],
  avgTalkRatio: { agent: 55, customer: 45 }
};

/**
 * Optimized hook for real-time team metrics with improved performance
 */
export const useRealTimeTeamMetrics = (filters?: DataFilters): [TeamMetrics, boolean] => {
  const { metrics, isLoading, error } = useSharedTeamMetrics(filters);
  // Add a longer delay to loading state transitions to prevent flickering
  const stableLoading = useStableLoadingState(isLoading, 300); // Increased delay for UI stability
  
  // Stabilize metrics with memoization to prevent UI jitter
  const stableMetrics = useMemo(() => {
    // Always return metrics with defaults to ensure UI never shows blank values
    return {
      ...DEFAULT_TEAM_METRICS, // First spread defaults to ensure all properties have values
      ...(metrics || {}), // Then override with actual metrics if available
      // Ensure performance score has a value and is stabilized
      performanceScore: metrics?.performanceScore !== undefined ? 
        Math.floor(metrics.performanceScore) : DEFAULT_TEAM_METRICS.performanceScore,
      // Ensure conversion rate has a value and is stabilized  
      conversionRate: metrics?.conversionRate !== undefined ? 
        Math.floor(metrics.conversionRate) : DEFAULT_TEAM_METRICS.conversionRate,
      // Ensure total calls has a value and is stabilized
      totalCalls: metrics?.totalCalls !== undefined ? 
        Math.floor(metrics.totalCalls) : DEFAULT_TEAM_METRICS.totalCalls,
      // Ensure talk ratio always has values and is stabilized
      avgTalkRatio: {
        agent: metrics?.avgTalkRatio?.agent !== undefined ? 
          Math.floor(metrics.avgTalkRatio.agent) : DEFAULT_TEAM_METRICS.avgTalkRatio.agent,
        customer: metrics?.avgTalkRatio?.customer !== undefined ? 
          Math.floor(metrics.avgTalkRatio.customer) : DEFAULT_TEAM_METRICS.avgTalkRatio.customer
      },
      // Ensure we have valid defaults for other properties
      topKeywords: metrics?.topKeywords?.length ? 
        metrics.topKeywords : DEFAULT_TEAM_METRICS.topKeywords,
      avgSentiment: metrics?.avgSentiment !== undefined ? 
        Math.floor(metrics.avgSentiment * 100) / 100 : DEFAULT_TEAM_METRICS.avgSentiment
    };
  }, [metrics]);
  
  // Log errors for monitoring but don't impact the UI
  useEffect(() => {
    if (error) {
      console.error("Error loading team metrics:", error);
      errorHandler.handleError({
        message: "Couldn't load team metrics",
        technical: typeof error === 'string' ? error : JSON.stringify(error),
        severity: "warning",
        code: "TEAM_METRICS_ERROR"
      }, "TeamMetrics");
    }
  }, [error]);
  
  return [stableMetrics, stableLoading];
};

// Default rep metrics for when data is loading or unavailable
const DEFAULT_REP_METRICS: RepMetrics[] = [
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
];

/**
 * Optimized hook for real-time rep metrics with improved performance
 */
export const useRealTimeRepMetrics = (repIds?: string[]): [RepMetrics[], boolean] => {
  const filters: DataFilters = useMemo(() => 
    repIds ? { repIds } : {}, [repIds]
  );
  
  // Modified this part to ensure proper typing
  const repMetricsResponse = useSharedRepMetrics(filters);
  const { metrics, isLoading } = repMetricsResponse;
  // Access the error property safely
  const error = 'error' in repMetricsResponse ? repMetricsResponse.error : undefined;
  
  const stableLoading = useStableLoadingState(isLoading, 300); // Increased from 100ms to 300ms for stability
  
  // Use default metrics when loading or no data available
  const stableMetrics = useMemo(() => {
    if (!metrics || metrics.length === 0) {
      return DEFAULT_REP_METRICS;
    }
    
    return metrics.map(rep => ({
      ...rep,
      // Floor percentage values for stability instead of rounding
      successRate: Math.floor(rep.successRate),
      sentiment: Math.floor(rep.sentiment * 100) / 100,
      // Ensure call volume is stable
      callVolume: Math.floor(rep.callVolume)
    }));
  }, [metrics]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      errorHandler.handleError({
        message: "Couldn't load rep metrics",
        technical: error ? (typeof error === 'string' ? error : JSON.stringify(error)) : 'Unknown error',
        severity: "warning",
        code: "REP_METRICS_ERROR"
      }, "RepMetrics");
    }
  }, [error]);
  
  return [stableMetrics, stableLoading];
};
