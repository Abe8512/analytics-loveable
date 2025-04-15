
export interface TeamMetric {
  team_id: string;
  team_name: string;
  call_count: number;
  avg_sentiment: number;
  avg_duration: number;
}

export interface RepMetric {
  rep_id: string;
  rep_name: string;
  call_count: number;
  avg_sentiment: number;
  conversion_rate: number;
}

export type TeamMetrics = TeamMetric[];
export type RepMetrics = RepMetric[];

export type SpeakerType = 'agent' | 'customer' | 'unknown';
