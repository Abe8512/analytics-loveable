
import { SentimentType } from './call';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  avatar_url?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export type BulkUploadState = 'idle' | 'uploading' | 'complete' | 'error';

export interface BulkUploadFilter {
  force?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TeamPerformanceMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  performance: 'good' | 'average' | 'poor';
  rep_id?: string;
}

export interface TeamPerformance {
  rep_id: string;
  rep_name: string;
  call_volume: number;
  avg_call_duration: number;
  sentiment_score: number;
  success_rate: number;
  avg_talk_ratio: number;
  objection_handling_score: number;
  positive_language_score: number;
  top_keywords: string[];
  last_call_date: string;
  // For compatibility with existing code
  id?: string;
  name?: string;
  calls?: number;
  successRate?: number;
  avgSentiment?: number;
  conversionRate?: number;
}

export interface TeamTranscriptActivityProps {
  memberId: string | null;
}
