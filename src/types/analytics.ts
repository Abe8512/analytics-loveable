
// Common analytics types

export interface CallMetrics {
  total: number;
  avgDuration: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

export interface RepMetrics {
  repId: string;
  repName: string;
  callVolume: number;
  sentiment: number;
  performance: number;
  topKeywords: string[];
}

export interface KeywordTrend {
  keyword: string;
  category: string;
  count: number;
  date: string;
}

export interface SentimentTrend {
  label: string;
  value: number;
  date: string;
}

export interface CallActivity {
  id: string;
  date: string;
  repId: string;
  repName: string;
  customer: string;
  duration: number;
  sentiment: number;
  outcome: string;
}

export interface TeamPerformance {
  id: string;
  name: string;
  calls: number;
  successRate: number;
  avgSentiment: number;
  conversionRate: number;
}
