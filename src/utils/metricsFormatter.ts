
import { FormattedMetrics, RawMetricsRecord } from '@/types/metrics';

/**
 * Creates empty formatted metrics object
 * @returns Empty formatted metrics
 */
export const createEmptyFormattedMetrics = (): FormattedMetrics => {
  return {
    totalCalls: 0,
    avgDuration: '0:00',
    avgDurationSeconds: 0,
    avgDurationMinutes: 0,
    totalDuration: 0,
    positiveCallsCount: 0,
    negativeCallsCount: 0,
    neutralCallsCount: 0,
    positiveSentimentPercent: 33,
    negativeSentimentPercent: 33,
    neutralSentimentPercent: 34,
    avgSentiment: 0.5,
    avgSentimentPercent: 50,
    callScore: 0,
    conversionRate: 0,
    agentTalkRatio: 50,
    customerTalkRatio: 50,
    topKeywords: [],
    reportDate: new Date().toISOString().split('T')[0]
  };
};

/**
 * Formats raw metrics data for display
 * @param metrics Raw metrics record
 * @returns Formatted metrics data
 */
export const formatMetricsForDisplay = (metrics: RawMetricsRecord): FormattedMetrics => {
  if (!metrics) return createEmptyFormattedMetrics();
  
  // Format duration from seconds to minutes and seconds
  const formatDuration = (seconds: number = 0) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
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
  
  return {
    totalCalls: metrics.total_calls || 0,
    avgDuration: formatDuration(metrics.avg_duration),
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
