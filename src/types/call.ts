
export interface CallTranscript {
  id: string;
  user_id?: string;
  text: string;
  duration?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  call_score?: number;
  keywords?: string[];
  transcript_segments?: any[];
  created_at?: string;
  metadata?: any;
  user_name?: string;
  customer_name?: string;
  filename?: string;
}

export interface Call {
  id: string;
  user_id?: string;
  duration: number;
  sentiment_agent?: number;
  sentiment_customer?: number;
  talk_ratio_agent?: number;
  talk_ratio_customer?: number;
  key_phrases?: string[];
  created_at?: string;
  filename?: string;
  transcription_text?: string;
  filler_word_count?: number;
  customer_engagement?: number;
  objection_count?: number;
  speaking_speed?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
