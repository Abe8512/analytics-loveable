
import { Json } from './supabase';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export type CallStatus = 'completed' | 'in-progress' | 'cancelled' | 'scheduled';

export interface CallTranscriptSegment {
  id: string;
  start_time: number;
  end_time: number;
  speaker: 'agent' | 'customer';
  text: string;
  sentiment?: SentimentType;
}

export interface CallTranscript {
  id: string;
  call_id: string;
  assigned_to?: string;
  transcript_segments: CallTranscriptSegment[];
  sentiment: SentimentType;
  text?: string;
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

// Utility function to safely cast database records to CallTranscript
export function castToCallTranscript(data: any): CallTranscript {
  // Default segments as empty array if not present or not in correct format
  let transcript_segments: CallTranscriptSegment[] = [];
  
  // Attempt to parse transcript_segments if it exists
  if (data.transcript_segments) {
    if (Array.isArray(data.transcript_segments)) {
      transcript_segments = data.transcript_segments;
    } else if (typeof data.transcript_segments === 'string') {
      try {
        transcript_segments = JSON.parse(data.transcript_segments);
      } catch (e) {
        console.error('Failed to parse transcript_segments', e);
      }
    }
  }

  // Create a well-formed CallTranscript object
  const transcript: CallTranscript = {
    id: data.id || '',
    call_id: data.call_id || '',
    transcript_segments: transcript_segments,
    sentiment: (data.sentiment as SentimentType) || 'neutral',
    text: data.text || '',
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    key_phrases: Array.isArray(data.key_phrases) ? data.key_phrases : [],
    assigned_to: data.assigned_to,
    created_at: data.created_at,
    updated_at: data.updated_at,
    user_name: data.user_name,
    customer_name: data.customer_name,
    duration: data.duration,
    call_score: data.call_score,
    end_time: data.end_time,
    filename: data.filename
  };

  return transcript;
}
