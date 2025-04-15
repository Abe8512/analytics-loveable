
import { CallTranscriptSegment, safeSegmentCast } from './metrics';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface CallTranscript {
  id: string;
  text: string;
  duration: number;
  sentiment: number | SentimentType;
  created_at: string;
  filename?: string;
  customer_name?: string;
  user_name?: string;
  call_id?: string;
  call_score?: number;
  start_time?: string;
  end_time?: string;
  speaker_count?: number;
  user_id?: string;
  keywords?: string[];
  key_phrases?: string[];
  assigned_to?: string;
  metadata?: any;
  transcript_segments?: CallTranscriptSegment[];
}

// Helper function to safely cast a database record to CallTranscript with proper typing
export function safeCallTranscriptCast(data: any): CallTranscript {
  // Handle segments properly - either parse from JSON or map if already an array
  let segments: CallTranscriptSegment[] = [];
  
  if (data.transcript_segments) {
    if (typeof data.transcript_segments === 'string') {
      try {
        segments = JSON.parse(data.transcript_segments).map(safeSegmentCast);
      } catch (e) {
        console.error('Error parsing transcript segments:', e);
      }
    } else if (Array.isArray(data.transcript_segments)) {
      segments = data.transcript_segments.map(safeSegmentCast);
    }
  }
  
  return {
    id: data.id || '',
    text: data.text || '',
    duration: typeof data.duration === 'number' ? data.duration : parseFloat(data.duration || '0'),
    sentiment: data.sentiment || 'neutral',
    created_at: data.created_at || new Date().toISOString(),
    filename: data.filename,
    customer_name: data.customer_name,
    user_name: data.user_name,
    call_id: data.call_id,
    call_score: data.call_score,
    start_time: data.start_time,
    end_time: data.end_time,
    speaker_count: data.speaker_count,
    user_id: data.user_id,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    key_phrases: Array.isArray(data.key_phrases) ? data.key_phrases : [],
    assigned_to: data.assigned_to,
    metadata: data.metadata || {},
    transcript_segments: segments
  };
}
