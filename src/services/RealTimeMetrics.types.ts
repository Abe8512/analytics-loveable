
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

// Add mapping interfaces for database types
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
