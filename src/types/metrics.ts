
import { SpeakerType } from '@/utils/metricCalculations';

export interface AdvancedMetric {
  name: string;
  callVolume: number;
  sentiment: number;
  conversion: number;
  date?: string;
}

export interface TalkRatioMetrics {
  agent_ratio: number;
  prospect_ratio: number;
  dominance_score: number;
  agent_talk_time: number;
  prospect_talk_time: number;
  silence_time: number;
  interruption_count: number;
}

export interface SentimentHeatmapPoint {
  time: number;
  score: number;
  label: string;
  text_snippet: string;
}

export interface ObjectionDetail {
  time: number;
  text: string;
  handled: boolean;
}

export interface ObjectionHandlingMetrics {
  total_objections: number;
  handled_objections: number;
  effectiveness: number;
  details: ObjectionDetail[];
}

export interface CallTranscriptSegment {
  id?: string;
  start: number;
  end: number;
  speaker: SpeakerType;
  text: string;
  start_time?: string;
  end_time?: string;
}

// Helper functions to safely cast types
export function safeSegmentCast(segment: any): CallTranscriptSegment {
  return {
    id: segment.id || '',
    start: typeof segment.start === 'number' ? segment.start : parseFloat(segment.start || '0'),
    end: typeof segment.end === 'number' ? segment.end : parseFloat(segment.end || '0'),
    speaker: segment.speaker || 'unknown',
    text: segment.text || '',
    start_time: segment.start_time || '',
    end_time: segment.end_time || ''
  };
}
