
export type SpeakerType = 'agent' | 'client' | 'silence';

export interface RealTimeMetricData {
  id: string;
  speaker: SpeakerType;
  text: string;
  startTime: number;
  endTime: number;
  sentiment?: number;
  isQuestion?: boolean;
  keywords?: string[];
  intensity?: number;
}

export type MetricUpdateType = 
  | 'speech'
  | 'sentiment'
  | 'energy'
  | 'question'
  | 'keyword'
  | 'objection'
  | 'silence';

export interface MetricUpdate {
  type: MetricUpdateType;
  timestamp: number;
  value: MetricValue;
}

export interface MetricValue {
  [key: string]: any;
  speaker?: SpeakerType;
  text?: string;
  score?: number;
  duration?: number;
}
