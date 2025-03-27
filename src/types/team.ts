
export interface TeamPerformanceMetric {
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
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
  avatar?: string;
}

export interface TeamPerformance {
  id: string;
  name: string;
  calls: number;
  successRate: number;
  avgSentiment: number;
  conversionRate: number;
}
