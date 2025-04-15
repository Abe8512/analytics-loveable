export interface MetricsData {
  totalCalls: number;
  avgDuration: number;
  positiveSentiment: number;
  negativeSentiment: number;
  neutralSentiment: number;
  avgSentiment: number;
  callScore: number;
  conversionRate: number;
  agentTalkRatio: number;
  customerTalkRatio: number;
  topKeywords: string[];
  lastUpdated?: Date;
  reportDate?: string;
  isLoading?: boolean;
  isUsingDemoData?: boolean;
  lastError?: string | null;
}

export const initialMetricsData: MetricsData = {
  totalCalls: 0,
  avgDuration: 0,
  positiveSentiment: 0,
  negativeSentiment: 0,
  neutralSentiment: 0,
  avgSentiment: 0,
  callScore: 0,
  conversionRate: 0,
  agentTalkRatio: 0,
  customerTalkRatio: 0,
  topKeywords: [],
  isLoading: true,
  isUsingDemoData: false,
  lastError: null
};

/**
 * Filters for metrics queries
 */
export interface MetricsFilters {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  repIds?: string[];
  repId?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  category?: string;
}

/**
 * Raw metrics record from database
 */
export interface RawMetricsRecord {
  id?: string;
  report_date?: string;
  total_calls: number;
  avg_duration: number;
  total_duration?: number;
  positive_sentiment_count: number;
  negative_sentiment_count: number;
  neutral_sentiment_count: number;
  avg_sentiment: number;
  performance_score?: number;
  conversion_rate?: number;
  agent_talk_ratio: number;
  customer_talk_ratio: number;
  top_keywords?: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Formatted metrics for display
 */
export interface FormattedMetrics {
  totalCalls: number;
  avgDuration: string;
  avgDurationSeconds: number;
  avgDurationMinutes: number;
  totalDuration: number;
  positiveCallsCount: number;
  negativeCallsCount: number;
  neutralCallsCount: number;
  positiveSentimentPercent: number;
  negativeSentimentPercent: number;
  neutralSentimentPercent: number;
  avgSentiment: number;
  avgSentimentPercent: number;
  callScore: number;
  conversionRate: number;
  agentTalkRatio: number;
  customerTalkRatio: number;
  topKeywords: string[];
  reportDate: string;
}

export interface AdvancedMetric {
  name: string;
  callVolume: number;
  sentiment: number;
  conversion: number;
}

export interface TopKeyword {
  keyword: string;
  count: number;
  category?: string;
  trend?: string;
}

export interface CallOutcome {
  name: string;
  outcome?: string;
  count: number;
  percentage: number;
}

export interface CallMetric {
  name: string;
  value: number;
  change?: number;
  status?: 'increase' | 'decrease' | 'stable';
}

export interface CallQualityMetric {
  name: string;
  score?: number; 
  value?: number;
  maxScore?: number;
  category?: string;
}

export interface TeamMetricsData {
  name?: string;
  performanceScore?: number;
  totalCalls: number;
  conversionRate: number;
  avgSentiment: number;
  topKeywords: string[];
  avgTalkRatio: {
    agent: number;
    customer: number;
  };
}

export interface RepMetricsData {
  id: string;
  name: string;
  callVolume: number;
  successRate: number;
  sentiment: number;
  avgCallDuration?: number;
  avgSentimentScore?: number;
  objectionHandlingScore?: number;
  positiveLanguageScore?: number;
  insights: string[];
}
