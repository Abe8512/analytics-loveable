
export type SpeakerType = 'agent' | 'client' | 'customer';

export interface RealTimeMetricData {
  timestamp: number;
  value: number;
  type: string;
}

export interface MetricValue {
  value: number;
  previous?: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export type MetricUpdateType = 
  | 'talk_ratio'
  | 'sentiment'
  | 'duration'
  | 'key_phrase'
  | 'speaker_active';

export interface MetricUpdate {
  type: MetricUpdateType;
  value: any;
  timestamp: number;
}

export interface TeamMetric {
  team_name: string;
  team_id: string;
  call_count: number;
  avg_sentiment: number;
  conversion_rate: number;
}

export interface RepMetric {
  rep_name: string;
  rep_id: string;
  call_count: number;
  avg_sentiment: number;
  conversion_rate: number;
}

export interface TalkRatio {
  agent: number;
  client: number;
}

export interface SpeakerActivity {
  agent: boolean;
  customer: boolean;
}

export interface KeyPhrase {
  text: string;
  sentiment?: number;
  timestamp?: number;
}
