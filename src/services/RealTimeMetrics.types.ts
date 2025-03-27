
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
