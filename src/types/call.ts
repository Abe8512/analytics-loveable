
import { Json } from '@/types/supabase';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface CallTranscriptSegment {
  id: string;
  start_time: number;
  end_time: number;
  speaker: string;
  text: string;
}

export interface CallTranscript {
  id: string;
  call_id?: string;
  text: string;
  filename?: string;
  sentiment?: SentimentType | number;
  keywords?: string[];
  key_phrases?: string[];
  duration?: number;
  created_at?: string;
  transcript_segments?: CallTranscriptSegment[];
  user_id?: string;
  user_name?: string;
  customer_name?: string;
  assigned_to?: string;
  call_score?: number;
  metadata?: any;
  start_time?: string;
  end_time?: string;
  speaker_count?: number;
  transcription_text?: string;
}

export interface TalkRatio {
  agent: number;
  customer: number;
}

export interface CallHistory {
  id: string;
  date: string;
  duration: number;
  sentiment?: number | {
    agent: number;
    customer: number;
  };
  talkRatio?: {
    agent: number;
    customer: number;
  };
  keyPhrases?: {
    text: string;
    sentiment?: number;
  }[];
}

export function castToCallTranscript(data: any): CallTranscript {
  return {
    id: data.id,
    call_id: data.call_id,
    text: data.text || '',
    filename: data.filename,
    sentiment: data.sentiment,
    keywords: data.keywords || [],
    key_phrases: data.key_phrases || [],
    duration: data.duration || 0,
    created_at: data.created_at,
    transcript_segments: Array.isArray(data.transcript_segments) 
      ? data.transcript_segments
      : [],
    user_id: data.user_id,
    user_name: data.user_name,
    customer_name: data.customer_name,
    assigned_to: data.assigned_to,
    call_score: data.call_score,
    metadata: data.metadata || {},
    start_time: data.start_time,
    end_time: data.end_time,
    speaker_count: data.speaker_count,
    transcription_text: data.transcription_text
  };
}
