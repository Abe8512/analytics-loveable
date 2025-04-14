
import { RawMetricsRecord, FormattedMetrics } from '@/types/metrics';

/**
 * Formats raw metrics data for UI display
 * @param {RawMetricsRecord} metrics - Raw metrics data from the database
 * @returns {FormattedMetrics} Formatted metrics data ready for display
 */
export const formatMetricsForDisplay = (metrics: RawMetricsRecord): FormattedMetrics => {
  if (!metrics) {
    return createEmptyFormattedMetrics();
  }
  
  // Calculate sentiment percentages safely
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
    
  // Ensure the total is exactly 100%
  const neutralSentimentPercent = totalSentiment > 0 
    ? 100 - positiveSentimentPercent - negativeSentimentPercent
    : 34;
  
  // Format duration from seconds to minutes and seconds
  const avgDurationSeconds = metrics.avg_duration || 0;
  const minutes = Math.floor(avgDurationSeconds / 60);
  const remainingSeconds = Math.floor(avgDurationSeconds % 60);
  const formattedDuration = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  
  return {
    totalCalls: metrics.total_calls || 0,
    avgDuration: formattedDuration,
    avgDurationSeconds: avgDurationSeconds,
    avgDurationMinutes: Math.round(avgDurationSeconds / 60),
    totalDuration: metrics.total_duration || 0,
    positiveCallsCount: metrics.positive_sentiment_count || 0,
    negativeCallsCount: metrics.negative_sentiment_count || 0,
    neutralCallsCount: metrics.neutral_sentiment_count || 0,
    positiveSentimentPercent,
    negativeSentimentPercent,
    neutralSentimentPercent,
    avgSentiment: metrics.avg_sentiment || 0.5,
    avgSentimentPercent: Math.round((metrics.avg_sentiment || 0.5) * 100),
    callScore: metrics.performance_score || 0,
    conversionRate: metrics.conversion_rate ? Math.round(metrics.conversion_rate * 100) : 0,
    agentTalkRatio: Math.round(metrics.agent_talk_ratio || 50),
    customerTalkRatio: Math.round(metrics.customer_talk_ratio || 50),
    topKeywords: metrics.top_keywords || [],
    reportDate: metrics.report_date || new Date().toISOString().split('T')[0]
  };
};

/**
 * Creates empty formatted metrics with default values
 * @returns {FormattedMetrics} Default formatted metrics
 */
export const createEmptyFormattedMetrics = (): FormattedMetrics => {
  return {
    totalCalls: 0,
    avgDuration: "0:00",
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
};
