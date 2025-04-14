
export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface CallTranscript {
  id: string;
  call_id?: string;
  user_id?: string;
  text: string;
  filename?: string;
  duration?: number;
  sentiment?: SentimentType;
  keywords?: string[];
  key_phrases?: string[];
  created_at?: string;
  start_time?: string;
  end_time?: string;
  metadata?: any;
  call_score?: number;
  speaker_count?: number;
  user_name?: string;
  customer_name?: string;
  transcription_text?: string;
  assigned_to?: string;
  transcript_segments?: CallTranscriptSegment[];
}

export interface CallTranscriptSegment {
  id: string;
  start_time: number;
  end_time: number;
  speaker: string;
  text: string;
  sentiment?: number;
}

export interface CallSentiment {
  agent: number;
  customer: number;
  overall: number;
}
