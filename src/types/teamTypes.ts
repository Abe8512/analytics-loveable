
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  user_id?: string;
}

export interface TeamPerformance {
  id?: string;
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
  name?: string;
  calls?: number;
  successRate?: number;
  avgSentiment?: number;
  conversionRate?: number;
}

// Helper to safely cast from one TeamMember interface to another
export function safeTeamMemberCast(member: any): TeamMember {
  return {
    id: member.id || '',
    name: member.name || '',
    email: member.email || '',
    role: member.role || 'sales-rep',
    user_id: member.user_id || undefined
  };
}
