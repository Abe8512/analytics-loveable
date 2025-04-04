
import { formatMetricsForDisplay } from './metricsUtils';
import { 
  MetricsData, 
  RawMetricsRecord, 
  FormattedMetrics,
  initialMetricsData
} from '@/types/metrics';
import { generateDemoCallMetrics } from '@/services/DemoDataService';

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
  formattedMetrics: FormattedMetrics | null,
  isUsingDemoData: boolean
} => {
  // Default return values
  let metricsData: MetricsData = { ...initialMetricsData, isLoading };
  let formattedMetrics: FormattedMetrics | null = null;
  let isUsingDemoData = false;
  
  // If loading or error, return with appropriate flags
  if (isLoading) {
    return { metricsData, formattedMetrics, isUsingDemoData };
  }
  
  try {
    // Check if we have valid raw data
    if (rawData && typeof rawData === 'object' && Object.keys(rawData).length > 0) {
      // Format data for UI display
      formattedMetrics = formatMetricsForDisplay(rawData);
      
      if (formattedMetrics) {
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
      }
    } else if (hasError || !rawData) {
      // If we have an error or no data, use demo data
      console.log('Using demo metrics data due to missing or invalid data');
      const demoData = generateDemoCallMetrics()[0] as RawMetricsRecord;
      formattedMetrics = formatMetricsForDisplay(demoData);
      
      if (formattedMetrics) {
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
          isUsingDemoData: true,
          lastError: hasError ? 'Error fetching metrics' : 'No metrics data available'
        };
      }
      isUsingDemoData = true;
    }
  } catch (error) {
    console.error('Error processing metrics data:', error);
    
    // Fallback to demo data in case of error
    const demoData = generateDemoCallMetrics()[0] as RawMetricsRecord;
    formattedMetrics = formatMetricsForDisplay(demoData);
    
    if (formattedMetrics) {
      metricsData = {
        ...initialMetricsData,
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
        lastUpdated: new Date(),
        isLoading: false,
        isUsingDemoData: true,
        lastError: error instanceof Error ? error.message : 'Unknown error processing metrics'
      };
    }
    isUsingDemoData = true;
  }
  
  return { metricsData, formattedMetrics, isUsingDemoData };
};

/**
 * Extracts key performance indicators from metrics data
 * for use in dashboard displays
 */
export const extractDashboardKPIs = (metrics: FormattedMetrics | null) => {
  if (!metrics) {
    // Return default values if metrics is null or undefined
    return {
      totalCalls: 0,
      avgDuration: 0,
      positiveSentiment: 0,
      callScore: 0,
      conversionRate: 0
    };
  }
  
  return {
    totalCalls: metrics.totalCalls || 0,
    avgDuration: metrics.avgDurationMinutes || 0,
    positiveSentiment: metrics.positiveSentimentPercent || 0,
    callScore: metrics.callScore || 0,
    conversionRate: metrics.conversionRate || 0
  };
};
