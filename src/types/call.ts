
export interface CallTranscript {
  id: string;
  user_id?: string;
  call_id?: string;
  text: string;
  filename?: string;
  duration?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
  key_phrases?: string[];
  call_score?: number;
  transcript_segments?: any[];
  metadata?: any;
  created_at?: string;
  user_name?: string;
  customer_name?: string;
  start_time?: string;
  end_time?: string;
  speaker_count?: number;
  assigned_to?: string;
}
