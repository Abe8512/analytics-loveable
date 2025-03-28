
/**
 * Core metrics data structure
 * Contains all metrics data points and status information
 */
export interface MetricsData {
  // Call metrics
  totalCalls: number;
  avgDuration: number;
  positiveSentiment: number;
  negativeSentiment: number;
  neutralSentiment: number;
  avgSentiment: number;
  callScore: number;
  conversionRate: number;
  
  // Talk metrics
  agentTalkRatio: number;
  customerTalkRatio: number;
  
  // Keywords
  topKeywords: string[];
  
  // Time-based data
  lastUpdated: Date | null;
  reportDate: string;
  
  // Status
  isLoading: boolean;
  isUsingDemoData: boolean;
  lastError: string | null;
}

/**
 * Initial/default values for metrics data
 */
export const initialMetricsData: MetricsData = {
  totalCalls: 0,
  avgDuration: 0,
  positiveSentiment: 0,
  negativeSentiment: 0,
  neutralSentiment: 0,
  avgSentiment: 0,
  callScore: 0,
  conversionRate: 0,
  agentTalkRatio: 50,
  customerTalkRatio: 50,
  topKeywords: [],
  lastUpdated: null,
  reportDate: new Date().toISOString().split('T')[0],
  isLoading: true,
  isUsingDemoData: false,
  lastError: null
};

/**
 * Call outcome statistics
 */
export interface CallOutcome {
  outcome: string;
  count: number;
  percentage: number;
}

/**
 * Call performance metric
 */
export interface CallMetric {
  name: string;
  value: number;
  change: number; // Percentage change from previous period
  status: 'increase' | 'decrease' | 'stable';
}

/**
 * Call quality assessment metric
 */
export interface CallQualityMetric {
  name: string;
  score: number; 
  maxScore: number;
  category: 'excellent' | 'good' | 'average' | 'poor';
}

/**
 * Trending keyword with metadata
 */
export interface TopKeyword {
  keyword: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  category?: string;
}

/**
 * Performance metrics result
 * Complete set of call analytics metrics
 */
export interface MetricsResult {
  outcomeStats: CallOutcome[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  averageCallScore: number;
  callMetrics: CallMetric[];
  qualityMetrics: CallQualityMetric[];
  topKeywords: TopKeyword[];
  timeMetrics: {
    avgDuration: number;
    totalCallTime: number;
    timeOfDayDistribution: {[key: string]: number};
  };
  comparisonMetrics: {
    vsLastPeriod: {[key: string]: number};
    vsTeamAverage: {[key: string]: number};
  };
}

/**
 * Raw database metric record structure
 * Matches the call_metrics_summary table schema
 */
export interface RawMetricsRecord {
  id?: string;
  report_date?: string;
  total_calls?: number;
  total_duration?: number;
  avg_duration?: number;
  positive_sentiment_count?: number;
  neutral_sentiment_count?: number;
  negative_sentiment_count?: number;
  avg_sentiment?: number;
  agent_talk_ratio?: number;
  customer_talk_ratio?: number;
  performance_score?: number;
  conversion_rate?: number;
  top_keywords?: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Formatted metrics display data
 * Used for UI presentation of metrics
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

/**
 * Team metrics data for dashboard and analytics
 */
export interface TeamMetricsData {
  performanceScore?: number;
  totalCalls?: number;
  conversionRate?: number;
  avgSentiment?: number;
  topKeywords?: string[];
  avgTalkRatio?: {
    agent: number;
    customer: number;
  };
}

/**
 * Individual rep metrics data
 */
export interface RepMetricsData {
  id: string;
  name: string;
  callVolume: number;
  successRate: number;
  sentiment: number;
  insights: string[];
}

/**
 * Data filters for fetching metrics
 */
export interface MetricsFilters {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  repIds?: string[];
  teamId?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}
