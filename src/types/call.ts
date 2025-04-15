export interface CallTranscript {
  id: string;
  text: string;
  created_at?: string;
  updated_at?: string;
  filename?: string;
  duration?: number;
  sentiment?: string | SentimentScore;
  keywords?: string[];
  key_phrases?: string[];
  call_score?: number;
  transcript_segments?: CallTranscriptSegment[];
  user_name?: string;
  customer_name?: string;
  assigned_to?: string;
  metadata?: any;
}

export interface CallTranscriptSegment {
  id?: string;
  transcript_id?: string;
  speaker: string;
  text: string;
  start: number;
  end: number;
  confidence?: number;
  sentiment?: number;
}

export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface SentimentScore {
  agent: number;
  customer: number;
}

/**
 * Call history model for viewing past calls
 */
export interface CallHistory {
  id: string;
  date: string;
  duration: number;
  sentiment?: SentimentScore;
  talkRatio?: {
    agent: number;
    customer: number;
  };
  keyPhrases?: any[];
}

// Helper function to safely cast data to CallTranscript
export function castToCallTranscript(data: any): CallTranscript {
  return {
    id: data.id || '',
    text: data.text || '',
    created_at: data.created_at,
    updated_at: data.updated_at,
    filename: data.filename,
    duration: typeof data.duration === 'number' ? data.duration : 0,
    sentiment: data.sentiment,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    key_phrases: Array.isArray(data.key_phrases) ? data.key_phrases : [],
    call_score: typeof data.call_score === 'number' ? data.call_score : 0,
    transcript_segments: Array.isArray(data.transcript_segments) ? data.transcript_segments : [],
    user_name: data.user_name || '',
    customer_name: data.customer_name || 'Customer',
    assigned_to: data.assigned_to,
    metadata: data.metadata || {}
  };
}

// Alias for consistency with component usage
export const safeCallTranscriptCast = castToCallTranscript;
