/**
 * Enhanced metrics types for advanced call analytics
 */

// Objection Handling Metrics
export interface ObjectionData {
  id: string;
  call_id: string;
  objection_text: string;
  response_text?: string;
  timestamp: number;
  was_handled: boolean;
  objection_type: string;
  time_to_response?: number;
  created_at: string;
}

export interface ObjectionHandlingMetrics {
  total_objections: number;
  handled_objections: number;
  effectiveness: number;
  details: Array<{
    time: number;
    text: string;
    handled: boolean;
    response?: string;
    objection_type?: string;
  }>;
}

// Trial Close Metrics
export interface TrialCloseData {
  id: string;
  call_id: string;
  close_text: string;
  prospect_response?: string;
  sentiment_score?: number;
  was_successful: boolean;
  timestamp: number;
  created_at: string;
}

export interface TrialCloseMetrics {
  total_closes: number;
  successful_closes: number;
  effectiveness: number;
  details: Array<{
    time: number;
    text: string;
    successful: boolean;
    response?: string;
  }>;
}

// Price Sensitivity Metrics
export interface PriceSensitivityData {
  id: string;
  call_id: string;
  price_mention_text: string;
  response_text?: string;
  sentiment_score: number;
  timestamp: number;
  created_at: string;
}

export interface PriceSensitivityMetrics {
  total_mentions: number;
  average_sentiment: number;
  negative_reactions: number;
  positive_reactions: number;
  details: Array<{
    time: number;
    text: string;
    sentiment: number;
    response?: string;
  }>;
}

// Sentiment Recovery Metrics
export interface SentimentTransitionData {
  id: string;
  call_id: string;
  from_sentiment: string;
  to_sentiment: string;
  transition_time: number;
  recovery_time?: number;
  recovery_success?: boolean;
  transition_text?: string;
  created_at: string;
}

export interface SentimentRecoveryMetrics {
  negative_moments: number;
  recovered_moments: number;
  recovery_score: number;
  avg_recovery_time: number;
  details: Array<{
    time: number;
    recovery_time?: number;
    successful: boolean;
    text?: string;
  }>;
}

// Empathy Metrics
export interface EmpathyMarkerData {
  id: string;
  call_id: string;
  empathy_text: string;
  empathy_type: string;
  timestamp: number;
  sentiment_context?: string;
  created_at: string;
}

export interface EmpathyMetrics {
  empathy_count: number;
  empathy_score: number;
  empathy_types: Record<string, number>;
  details: Array<{
    time: number;
    text: string;
    type: string;
  }>;
}

// Competitor Mention Metrics
export interface CompetitorMentionData {
  id: string;
  call_id: string;
  competitor_name: string;
  mention_context?: string;
  was_countered: boolean;
  counter_argument?: string;
  timestamp: number;
  created_at: string;
}

export interface CompetitorMentionMetrics {
  total_mentions: number;
  countered_mentions: number;
  counter_rate: number;
  competitors: Record<string, number>;
  details: Array<{
    time: number;
    competitor: string;
    countered: boolean;
    text?: string;
  }>;
}

// Call Quality Metrics
export interface CallQualityData {
  id: string;
  call_id: string;
  objection_handling_score: number;
  trial_close_score: number;
  price_handling_score: number;
  sentiment_recovery_score: number;
  empathy_score: number;
  competitor_handling_score: number;
  overall_quality_score: number;
  created_at: string;
  updated_at: string;
}

// Enhanced Call Data
export interface EnhancedCallData {
  objection_count: number;
  trial_closes_count: number;
  empathy_markers_count: number;
  sentiment_recovery_score: number;
  quality_score: number;
}

// Complete Enhanced Metrics
export interface EnhancedMetrics {
  objection_handling: ObjectionHandlingMetrics;
  trial_closes: TrialCloseMetrics;
  price_sensitivity: PriceSensitivityMetrics;
  sentiment_recovery: SentimentRecoveryMetrics;
  empathy: EmpathyMetrics;
  competitor_mentions: CompetitorMentionMetrics;
  quality_scores: {
    objection_handling_score: number;
    trial_close_score: number;
    price_handling_score: number;
    sentiment_recovery_score: number;
    empathy_score: number;
    competitor_handling_score: number;
    overall_quality_score: number;
  };
} 