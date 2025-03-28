
import { RawMetricsRecord, FormattedMetrics, TeamMetricsData, RepMetricsData } from '@/types/metrics';

/**
 * Processes raw metrics data into standardized TeamMetricsData format
 * @param rawMetrics Raw metrics data from database
 * @returns Processed TeamMetricsData object
 */
export const processTeamMetrics = (rawMetrics: RawMetricsRecord | null): TeamMetricsData => {
  if (!rawMetrics) {
    return {
      performanceScore: 75,
      totalCalls: 0,
      conversionRate: 0,
      avgSentiment: 0.5,
      topKeywords: [],
      avgTalkRatio: {
        agent: 50,
        customer: 50
      }
    };
  }

  return {
    performanceScore: rawMetrics.performance_score || 75,
    totalCalls: rawMetrics.total_calls || 0,
    conversionRate: rawMetrics.conversion_rate || 0,
    avgSentiment: rawMetrics.avg_sentiment || 0.5,
    topKeywords: rawMetrics.top_keywords || [],
    avgTalkRatio: {
      agent: rawMetrics.agent_talk_ratio || 50,
      customer: rawMetrics.customer_talk_ratio || 50
    }
  };
};

/**
 * Processes raw metrics data into FormattedMetrics for display
 * @param metrics Raw metrics data from database
 * @returns Formatted metrics for display
 */
export const formatMetricsForDisplay = (metrics: RawMetricsRecord): FormattedMetrics | null => {
  if (!metrics) return null;
  
  // Format duration from seconds to minutes and seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
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
 * Creates demo metrics data for testing
 * @returns Array of demo metrics records
 */
export const createDemoMetricsData = (): RawMetricsRecord[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return [
    {
      id: "demo-today",
      report_date: today.toISOString().split('T')[0],
      total_calls: 24,
      avg_duration: 360,
      total_duration: 8640,
      positive_sentiment_count: 18,
      negative_sentiment_count: 3,
      neutral_sentiment_count: 3,
      avg_sentiment: 0.75,
      agent_talk_ratio: 45,
      customer_talk_ratio: 55,
      performance_score: 82,
      conversion_rate: 0.35,
      top_keywords: ["solution", "problem", "opportunity", "value", "pricing"],
      created_at: today.toISOString(),
      updated_at: today.toISOString()
    },
    {
      id: "demo-yesterday",
      report_date: yesterday.toISOString().split('T')[0],
      total_calls: 21,
      avg_duration: 330,
      total_duration: 6930,
      positive_sentiment_count: 14,
      negative_sentiment_count: 4,
      neutral_sentiment_count: 3,
      avg_sentiment: 0.68,
      agent_talk_ratio: 48,
      customer_talk_ratio: 52,
      performance_score: 78,
      conversion_rate: 0.32,
      top_keywords: ["solution", "problem", "opportunity", "value", "concerns"],
      created_at: yesterday.toISOString(),
      updated_at: yesterday.toISOString()
    }
  ];
};
