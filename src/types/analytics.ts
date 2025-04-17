
/**
 * Team performance metrics interface
 */
export interface TeamPerformance {
  id: string;
  name: string;
  rep_id?: string;
  rep_name?: string;
  calls: number;
  call_volume?: number;
  active_reps?: number;
  total_calls?: number;
  avg_duration?: number;
  avg_call_duration?: number;
  avg_sentiment?: number;
  sentiment_score?: number;
  positive_calls?: number;
  negative_calls?: number;
  success_rate?: number;
  successRate: number;
  avgSentiment: number;
  conversionRate: number;
}

/**
 * Analytics metrics and insights interface
 */
export interface AnalyticsMetrics {
  totalCalls: number;
  avgDuration: number;
  avgDurationMinutes?: number;
  conversionRate: number;
  sentimentScore: number;
  positiveSentimentPercent: number;
  neutralSentimentPercent: number;
  negativeSentimentPercent: number;
  talkRatioAgent: number;
  talkRatioCustomer: number;
  topKeywords: string[];
  performanceScore: number;
}

/**
 * Keyword trend data interface
 */
export interface KeywordTrend {
  keyword: string;
  occurrences: number;
  trend: number;
  category?: string;
}
