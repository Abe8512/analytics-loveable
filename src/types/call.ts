
export type SentimentType = 'positive' | 'negative' | 'neutral';

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
  sentiment_data?: CallSentiment;
}

// Add a helper to safely cast database objects to CallTranscript
export const castToCallTranscript = (data: any): CallTranscript => {
  // Handle the transcript_segments conversion
  let segments: CallTranscriptSegment[] = [];
  if (data.transcript_segments) {
    try {
      if (typeof data.transcript_segments === 'string') {
        segments = JSON.parse(data.transcript_segments);
      } else if (Array.isArray(data.transcript_segments)) {
        segments = data.transcript_segments.map((segment: any) => ({
          id: segment.id || `segment-${Math.random().toString(36).substring(2, 9)}`,
          start_time: Number(segment.start_time || segment.start || 0),
          end_time: Number(segment.end_time || segment.end || 0),
          speaker: segment.speaker || 'unknown',
          text: segment.text || '',
          sentiment: segment.sentiment || 0
        }));
      }
    } catch (e) {
      console.error('Error parsing transcript segments:', e);
      segments = [];
    }
  }

  // Make sure sentiment is a valid SentimentType
  let sentimentValue: SentimentType = 'neutral';
  if (data.sentiment === 'positive' || data.sentiment === 'negative' || data.sentiment === 'neutral') {
    sentimentValue = data.sentiment;
  } else if (typeof data.sentiment === 'number') {
    sentimentValue = data.sentiment > 0.6 ? 'positive' : data.sentiment < 0.4 ? 'negative' : 'neutral';
  } else if (typeof data.sentiment === 'string') {
    // Try to convert other string formats
    const lowerSentiment = data.sentiment.toLowerCase();
    if (lowerSentiment.includes('pos')) {
      sentimentValue = 'positive';
    } else if (lowerSentiment.includes('neg')) {
      sentimentValue = 'negative';
    }
  }

  // Create sentiment_data if it doesn't exist
  const sentimentData: CallSentiment = data.sentiment_data || {
    agent: 0.5,
    customer: 0.5,
    overall: sentimentValue === 'positive' ? 0.8 : sentimentValue === 'negative' ? 0.2 : 0.5
  };

  return {
    id: data.id,
    call_id: data.call_id,
    user_id: data.user_id,
    text: data.text || '',
    filename: data.filename,
    duration: Number(data.duration) || 0,
    sentiment: sentimentValue,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    key_phrases: Array.isArray(data.key_phrases) ? data.key_phrases : [],
    created_at: data.created_at,
    start_time: data.start_time,
    end_time: data.end_time,
    metadata: data.metadata,
    call_score: Number(data.call_score) || 50,
    speaker_count: Number(data.speaker_count) || 2,
    user_name: data.user_name,
    customer_name: data.customer_name,
    transcription_text: data.transcription_text,
    assigned_to: data.assigned_to,
    transcript_segments: segments,
    sentiment_data: sentimentData
  };
};
