
/**
 * Team Types
 * Centralized type definitions for team-related data
 */

// Basic team member interface
export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar_url?: string;
  user_id?: string;
  createdAt?: string;
  avatar?: string; // For backward compatibility
}

// Team performance data
export interface TeamPerformance {
  id: string;
  name: string;
  calls: number;
  successRate: number;
  avgSentiment: number;
  conversionRate: number;
}

// Team member performance metrics
export interface TeamPerformanceMetric {
  rep_id: string;
  rep_name: string;
  call_volume: number;
  avg_call_duration: number;
  sentiment_score: number;
  success_rate: number;
  avg_talk_ratio: number;
  objection_handling_score?: number;
  positive_language_score?: number;
  top_keywords?: string[];
  last_call_date?: string;
}

// Response from team member fetch operations
export interface TeamMemberResponse {
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: Error | null;
  refreshTeamMembers: () => Promise<void>;
}
