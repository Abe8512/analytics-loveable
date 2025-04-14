
import { Json } from '@/types/supabase';

export type SpeakerType = 'agent' | 'client' | 'customer' | 'system' | 'unknown';
export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface CallTranscriptSegment {
  id: string;
  start_time: number;
  end_time: number;
  speaker: SpeakerType;
  text: string;
  sentiment?: number;
}

export interface CallSentiment {
  agent: number; // 0-1 scale
  customer: number; // 0-1 scale
  overall: number; // 0-1 scale
}

export interface CallTranscript {
  id: string;
  call_id?: string;
  user_id?: string;
  user_name?: string;
  created_at: string;
  updated_at?: string;
  filename: string;
  duration: number;
  sentiment: SentimentType;
  transcript_segments: CallTranscriptSegment[];
  sentiment_data?: CallSentiment;
  metadata?: Record<string, any>;
  keywords?: string[];
  key_phrases?: string[];
  call_score?: number;
  customer_name?: string;
  start_time?: string;
  end_time?: string;
  assigned_to?: string;
}

export interface CallHistory {
  id: string;
  date: string;
  duration: number;
  sentiment: number | { agent: number; customer: number };
}

// Helper function to safely cast data from Supabase to CallTranscript
export function castToCallTranscript(data: any): CallTranscript {
  // Create a base transcript object with default values
  const transcript: CallTranscript = {
    id: data.id || '',
    call_id: data.call_id || null,
    user_id: data.user_id || null,
    user_name: data.user_name || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || null,
    filename: data.filename || '',
    duration: data.duration || 0,
    sentiment: parseSentiment(data.sentiment),
    transcript_segments: parseTranscriptSegments(data.transcript_segments),
    sentiment_data: parseSentimentData(data.sentiment_data),
    metadata: data.metadata || {},
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    key_phrases: Array.isArray(data.key_phrases) ? data.key_phrases : [],
    call_score: data.call_score || null,
    customer_name: data.customer_name || null,
    start_time: data.start_time || null,
    end_time: data.end_time || null,
    assigned_to: data.assigned_to || null
  };
  
  return transcript;
}

// Parse sentiment string to SentimentType
function parseSentiment(sentiment: any): SentimentType {
  if (typeof sentiment === 'string') {
    const normalizedSentiment = sentiment.toLowerCase();
    if (normalizedSentiment === 'positive' || normalizedSentiment === 'negative' || normalizedSentiment === 'neutral') {
      return normalizedSentiment as SentimentType;
    }
  }
  return 'neutral'; // Default
}

// Parse transcript segments from JSON or array
function parseTranscriptSegments(segments: any): CallTranscriptSegment[] {
  if (!segments) return [];
  
  try {
    // If it's a JSON string, parse it
    if (typeof segments === 'string') {
      const parsed = JSON.parse(segments);
      return Array.isArray(parsed) ? parsed : [];
    }
    
    // If it's already an array, use it
    if (Array.isArray(segments)) {
      return segments.map(segment => ({
        id: segment.id || `segment-${Math.random().toString(36).substr(2, 9)}`,
        start_time: Number(segment.start_time) || 0,
        end_time: Number(segment.end_time) || 0,
        speaker: segment.speaker || 'unknown',
        text: segment.text || '',
        sentiment: segment.sentiment || undefined
      }));
    }
    
    // If it's a Json type from Supabase, handle accordingly
    if (segments && typeof segments === 'object') {
      return Array.isArray(segments) ? segments : [];
    }
  } catch (error) {
    console.error('Error parsing transcript segments:', error);
  }
  
  return [];
}

// Parse sentiment data
function parseSentimentData(data: any): CallSentiment | undefined {
  if (!data) return undefined;
  
  try {
    // If it's a JSON string, parse it
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return {
        agent: Number(parsed.agent) || 0.5,
        customer: Number(parsed.customer) || 0.5,
        overall: Number(parsed.overall) || 0.5
      };
    }
    
    // If it's already an object, use it
    if (data && typeof data === 'object') {
      return {
        agent: Number(data.agent) || 0.5,
        customer: Number(data.customer) || 0.5,
        overall: Number(data.overall) || 0.5
      };
    }
  } catch (error) {
    console.error('Error parsing sentiment data:', error);
  }
  
  return undefined;
}
