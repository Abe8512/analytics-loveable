
import { RepMetricsData, TeamMetricsData } from '@/types/metrics';

export interface TeamMetric {
  id?: string;
  team_name: string;
  call_count: number;
  avg_sentiment: number;
  avg_duration: number;
  conversion_rate: number;
}

export interface RepMetric {
  id?: string;
  rep_name: string;
  call_count: number;
  avg_sentiment: number;
  avg_duration: number;
  conversion_rate: number;
}

export interface MetricsHookResult<T> {
  metrics: T[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// Database types mapping interfaces
export interface RepMetricDb {
  id?: string;
  rep_name: string;
  rep_id: string;
  call_volume?: number;
  sentiment_score?: number;
  success_rate?: number;
  time_period?: string;
  insights?: string[];
  top_keywords?: string[];
  updated_at?: string;
}

export interface TeamMetricDb {
  id?: string;
  team_name?: string;
  call_volume?: number;
  sentiment_score?: number;
  success_rate?: number;
  agent_talk_ratio?: number;
  customer_talk_ratio?: number;
  time_period?: string;
}

// Mappings from database records to frontend types
export const mapRepDbToFrontend = (dbRecord: RepMetricDb): RepMetricsData => ({
  id: dbRecord.rep_id,
  name: dbRecord.rep_name,
  callVolume: dbRecord.call_volume || 0,
  successRate: dbRecord.success_rate || 0,
  sentiment: dbRecord.sentiment_score || 0.5,
  insights: dbRecord.insights || []
});

export const mapTeamDbToFrontend = (dbRecord: TeamMetricDb): TeamMetricsData => ({
  totalCalls: dbRecord.call_volume,
  avgSentiment: dbRecord.sentiment_score,
  conversionRate: dbRecord.success_rate,
  avgTalkRatio: {
    agent: dbRecord.agent_talk_ratio || 50,
    customer: dbRecord.customer_talk_ratio || 50
  }
});
