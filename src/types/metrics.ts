
export interface RawMetricsRecord {
  id: string;
  metrics: any;
  rep_id?: string;
  created_at?: string;
  updated_at?: string;
  call_id?: string;
  period?: string;
}

export interface FormattedMetrics {
  callVolume: number;
  avgCallDuration: number;
  avgSentimentScore: number;
  talkRatio: {
    agent: number;
    customer: number;
  };
  successRate: number;
  objectionHandlingScore: number;
  positiveLanguageScore: number;
  topKeywords: { text: string; count: number }[];
  callOutcomes: {
    success: number;
    failed: number;
    followUp: number;
  };
}

export interface MetricsData {
  callVolume: number;
  avgCallDuration: number;
  sentimentTrend: number[];
  successRate: number;
  callDistribution: {
    successful: number;
    unsuccessful: number;
    followUp: number;
  };
  talkRatio: {
    agent: number;
    customer: number;
  };
  teamMetrics: TeamPerformanceMetric[];
  topKeywords: TopKeyword[];
  qualityMetrics: CallQualityMetric[];
}

export const initialMetricsData: MetricsData = {
  callVolume: 0,
  avgCallDuration: 0,
  sentimentTrend: [],
  successRate: 0,
  callDistribution: {
    successful: 0,
    unsuccessful: 0,
    followUp: 0
  },
  talkRatio: {
    agent: 50,
    customer: 50
  },
  teamMetrics: [],
  topKeywords: [],
  qualityMetrics: []
};

export interface CallOutcome {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface CallMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  change: number;
}

export interface CallQualityMetric {
  name: string;
  value: number;
  target: number;
}

export interface TopKeyword {
  keyword: string;
  count: number;
  sentiment: number;
}

export interface TeamMetricsData {
  teamPerformance: TeamPerformanceMetric[];
  callVolume: number;
  avgCallDuration: number;
  avgSentimentScore: number;
  successRate: number;
}

export interface RepMetricsData {
  id: string;
  name: string;
  callVolume: number;
  avgCallDuration: number;
  successRate: number;
  avgSentimentScore: number;
  objectionHandlingScore: number;
  positiveLanguageScore: number;
}

export interface TeamPerformanceMetric {
  id: string;
  name: string;
  callVolume: number;
  avgCallDuration: number;
  sentimentScore: number;
  successRate: number;
  objectionHandlingScore?: number;
  avgTalkRatio?: number;
}

export interface MetricsFilters {
  startDate?: string;
  endDate?: string;
  repId?: string;
  outcome?: string;
  sentiment?: string;
  duration?: number;
  limit?: number;
}
