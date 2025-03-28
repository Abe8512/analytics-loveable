
import type { RawMetricsRecord, FormattedMetrics } from '@/types/metrics';

/**
 * Formats duration from seconds to minutes and seconds string
 * @param seconds Duration in seconds
 * @returns Formatted duration string "MM:SS"
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats duration from seconds to minutes
 * @param seconds Duration in seconds
 * @returns Duration in minutes
 */
export const formatDurationMinutes = (seconds: number): number => {
  return Math.round(seconds / 60);
};

/**
 * Formats a number to a percentage string
 * @param value Value to format as percentage
 * @returns Formatted percentage string with % symbol
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

/**
 * Calculates sentiment percentages from counts
 * @param positiveCount Number of positive sentiment items
 * @param neutralCount Number of neutral sentiment items
 * @param negativeCount Number of negative sentiment items
 * @returns Object with percentage values for each sentiment type
 */
export const calculateSentimentPercentages = (
  positiveCount: number,
  neutralCount: number,
  negativeCount: number
) => {
  const totalCount = positiveCount + neutralCount + negativeCount;
  
  if (totalCount === 0) {
    return {
      positivePercent: 0,
      neutralPercent: 0,
      negativePercent: 0
    };
  }
  
  return {
    positivePercent: (positiveCount / totalCount) * 100,
    neutralPercent: (neutralCount / totalCount) * 100,
    negativePercent: (negativeCount / totalCount) * 100
  };
};

/**
 * Formats metrics data for display
 * @param metrics Raw metrics data
 * @returns Formatted metrics with calculated values and formatted strings
 */
export const formatMetricsForDisplay = (metrics: RawMetricsRecord | null): FormattedMetrics | null => {
  if (!metrics) return null;
  
  // Calculate sentiment percentages
  const totalSentiment = 
    (metrics.positive_sentiment_count || 0) + 
    (metrics.neutral_sentiment_count || 0) + 
    (metrics.negative_sentiment_count || 0);
    
  const positiveSentimentPercent = totalSentiment > 0 
    ? Math.round((metrics.positive_sentiment_count || 0) / totalSentiment * 100) 
    : 33;
    
  const negativeSentimentPercent = totalSentiment > 0 
    ? Math.round((metrics.negative_sentiment_count || 0) / totalSentiment * 100) 
    : 33;
    
  const neutralSentimentPercent = totalSentiment > 0 
    ? Math.round((metrics.neutral_sentiment_count || 0) / totalSentiment * 100) 
    : 34;
  
  return {
    totalCalls: metrics.total_calls || 0,
    avgDuration: formatDuration(metrics.avg_duration || 0),
    avgDurationSeconds: metrics.avg_duration || 0,
    avgDurationMinutes: Math.round((metrics.avg_duration || 0) / 60),
    totalDuration: metrics.total_duration || 0,
    positiveCallsCount: metrics.positive_sentiment_count || 0,
    negativeCallsCount: metrics.negative_sentiment_count || 0,
    neutralCallsCount: metrics.neutral_sentiment_count || 0,
    positiveSentimentPercent,
    negativeSentimentPercent,
    neutralSentimentPercent,
    avgSentiment: metrics.avg_sentiment || 0.5,
    avgSentimentPercent: Math.round((metrics.avg_sentiment || 0.5) * 100),
    callScore: metrics.performance_score || 70,
    conversionRate: metrics.conversion_rate ? Math.round(metrics.conversion_rate * 100) : 0,
    agentTalkRatio: Math.round(metrics.agent_talk_ratio || 50),
    customerTalkRatio: Math.round(metrics.customer_talk_ratio || 50),
    topKeywords: metrics.top_keywords || [],
    reportDate: metrics.report_date || new Date().toISOString().split('T')[0]
  };
};

/**
 * Determines if a trend is positive or negative based on the metric type
 * @param metricName Name of the metric
 * @param change Percentage change value
 * @returns Whether the change is positive for this metric type
 */
export const isTrendPositive = (metricName: string, change: number): boolean => {
  // For these metrics, a decrease is positive
  const decreaseIsPositiveMetrics = [
    'avg duration',
    'duration',
    'talk ratio',
    'response time',
    'negative'
  ];
  
  const lowerCaseName = metricName.toLowerCase();
  const isDecreasePositive = decreaseIsPositiveMetrics.some(metric => 
    lowerCaseName.includes(metric)
  );
  
  return isDecreasePositive ? change < 0 : change > 0;
};

/**
 * Gets the color for a sentiment value
 * @param sentiment Sentiment value (0-100)
 * @returns CSS color value
 */
export const getSentimentColor = (sentiment: number): string => {
  if (sentiment >= 60) return '#22c55e'; // green
  if (sentiment <= 40) return '#ef4444'; // red
  return '#3b82f6'; // blue
};

/**
 * Converts raw database metrics record to MetricsData format
 * @param record Raw metrics record from database
 * @returns Structured metrics data
 */
export const convertRawToMetricsData = (record: RawMetricsRecord | null): Partial<FormattedMetrics> => {
  if (!record) return {};
  
  const sentimentTotal = 
    (record.positive_sentiment_count || 0) +
    (record.neutral_sentiment_count || 0) +
    (record.negative_sentiment_count || 0);
    
  const positiveSentiment = sentimentTotal > 0
    ? ((record.positive_sentiment_count || 0) / sentimentTotal) * 100
    : 0;
    
  const negativeSentiment = sentimentTotal > 0
    ? ((record.negative_sentiment_count || 0) / sentimentTotal) * 100
    : 0;
    
  const neutralSentiment = sentimentTotal > 0
    ? ((record.neutral_sentiment_count || 0) / sentimentTotal) * 100
    : 0;
    
  return {
    totalCalls: record.total_calls || 0,
    avgDurationSeconds: record.avg_duration || 0,
    avgDuration: formatDuration(record.avg_duration || 0),
    avgDurationMinutes: formatDurationMinutes(record.avg_duration || 0),
    totalDuration: record.total_duration || 0,
    positiveCallsCount: record.positive_sentiment_count || 0,
    negativeCallsCount: record.negative_sentiment_count || 0,
    neutralCallsCount: record.neutral_sentiment_count || 0,
    positiveSentimentPercent: Math.round(positiveSentiment),
    negativeSentimentPercent: Math.round(negativeSentiment),
    neutralSentimentPercent: Math.round(neutralSentiment),
    avgSentiment: record.avg_sentiment || 0.5,
    avgSentimentPercent: Math.round((record.avg_sentiment || 0.5) * 100),
    callScore: record.performance_score || 0,
    conversionRate: record.conversion_rate ? Math.round(record.conversion_rate * 100) : 0,
    agentTalkRatio: Math.round(record.agent_talk_ratio || 50),
    customerTalkRatio: Math.round(record.customer_talk_ratio || 50),
    topKeywords: record.top_keywords || [],
    reportDate: record.report_date || new Date().toISOString().split('T')[0]
  };
};
