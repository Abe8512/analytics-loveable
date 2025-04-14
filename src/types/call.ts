
import { Json } from './supabase';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export type CallStatus = 'completed' | 'in-progress' | 'cancelled' | 'scheduled';

export interface CallTranscriptSegment {
  id: string;
  start_time: number;
  end_time: number;
  speaker: 'agent' | 'customer';
  text: string;
}

export interface CallTranscript {
  id: string;
  call_id: string;
  assigned_to?: string;
  transcript_segments: CallTranscriptSegment[];
  sentiment: SentimentType;
  text?: string; // Add text property
  keywords?: string[];
  key_phrases?: string[];
  sentiment_data?: SentimentSegment[];
  metadata?: Record<string, any>; 
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  customer_name?: string;
  duration?: number;
  call_score?: number;
  end_time?: string;
  filename?: string;
}

export interface StoredTranscription {
  id: string;
  filename: string;
  text: string;
  created_at: string;
  duration: number;
  sentiment: SentimentType;
  keywords: string[];
}

export interface SentimentSegment {
  text: string;
  score: number;
  start_time: number;
  end_time: number;
  speaker: 'agent' | 'customer';
}

export interface CallInsight {
  id: string;
  call_id: string;
  insight_type: 'objection' | 'interest' | 'question' | 'concern';
  text: string;
  score: number;
  timestamp: number; 
  resolution?: string;
  resolved: boolean;
}

export interface CallHistory {
  id: string;
  user_id: string;
  customer_id?: string;
  start_time: string;
  end_time?: string;
  duration: number;
  status: CallStatus;
  call_type?: 'inbound' | 'outbound';
  outcome?: 'successful' | 'unsuccessful' | 'follow-up';
  notes?: string;
  sentiment?: SentimentType;
  call_score?: number;
  transcript_id?: string;
  user_name?: string;
  customer_name?: string;
  talkRatio?: {
    agent: number;
    customer: number;
  };
  keywords?: string[];
  keyPhrases?: string[];
}

export interface TalkTimeRatio {
  agent: number;
  customer: number;
}
