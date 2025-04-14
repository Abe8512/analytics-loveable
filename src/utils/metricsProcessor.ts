
import { formatMetricsForDisplay, createEmptyFormattedMetrics } from './metricsFormatter';
import { 
  MetricsData, 
  RawMetricsRecord, 
  FormattedMetrics,
  initialMetricsData
} from '@/types/metrics';

/**
 * Processes raw metrics data from various sources and provides
 * consistently formatted metrics for components
 */
export const processMetricsData = (
  rawData: RawMetricsRecord | null, 
  isLoading: boolean,
  hasError: boolean
): {
  metricsData: MetricsData,
  formattedMetrics: FormattedMetrics,
  isUsingDemoData: boolean
} => {
  // Default return values
  let metricsData: MetricsData = { ...initialMetricsData, isLoading };
  let formattedMetrics: FormattedMetrics = createEmptyFormattedMetrics();
  let isUsingDemoData = false;
  
  // If loading, return with appropriate flags
  if (isLoading) {
    return { metricsData, formattedMetrics, isUsingDemoData };
  }
  
  try {
    // Check if we have valid raw data
    if (rawData && typeof rawData === 'object' && Object.keys(rawData).length > 0) {
      // Format data for UI display
      formattedMetrics = formatMetricsForDisplay(rawData);
      
      // Convert formatted metrics to internal metrics format
      metricsData = {
        totalCalls: formattedMetrics.totalCalls,
        avgDuration: formattedMetrics.avgDurationSeconds,
        positiveSentiment: formattedMetrics.positiveSentimentPercent,
        negativeSentiment: formattedMetrics.negativeSentimentPercent,
        neutralSentiment: formattedMetrics.neutralSentimentPercent,
        avgSentiment: formattedMetrics.avgSentiment,
        callScore: formattedMetrics.callScore,
        conversionRate: formattedMetrics.conversionRate,
        agentTalkRatio: formattedMetrics.agentTalkRatio,
        customerTalkRatio: formattedMetrics.customerTalkRatio,
        topKeywords: formattedMetrics.topKeywords,
        reportDate: formattedMetrics.reportDate,
        lastUpdated: new Date(),
        isLoading: false,
        isUsingDemoData: false,
        lastError: null
      };
    } else if (hasError || !rawData) {
      console.log('No metrics data available');
      
      // Empty state with error flag
      metricsData = {
        ...initialMetricsData,
        isLoading: false,
        isUsingDemoData: false,
        lastError: hasError ? 'Error fetching metrics' : 'No metrics data available',
        lastUpdated: new Date()
      };
    }
  } catch (error) {
    console.error('Error processing metrics data:', error);
    
    // Fallback to empty state in case of error
    metricsData = {
      ...initialMetricsData,
      isLoading: false,
      isUsingDemoData: false,
      lastError: error instanceof Error ? error.message : 'Unknown error processing metrics',
      lastUpdated: new Date()
    };
  }
  
  return { metricsData, formattedMetrics, isUsingDemoData };
};

/**
 * Extracts key performance indicators from metrics data
 * for use in dashboard displays
 */
export const extractDashboardKPIs = (metrics: FormattedMetrics) => {
  return {
    totalCalls: metrics.totalCalls || 0,
    avgDuration: metrics.avgDurationMinutes || 0,
    positiveSentiment: metrics.positiveSentimentPercent || 0,
    callScore: metrics.callScore || 0,
    conversionRate: metrics.conversionRate || 0
  };
};
