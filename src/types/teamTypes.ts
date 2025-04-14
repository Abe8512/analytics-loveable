
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  avatar_url?: string; // Add this to match what some components expect
  user_id: string;
  member_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMemberResponse {
  data: TeamMember | null;
  error: any;
}

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
}

// Add TeamPerformance interface
export interface TeamPerformance {
  id: string;
  name: string;
  calls: number;
  successRate: number;
  avgSentiment: number;
  conversionRate: number;
  rep_id?: string; // Add this for compatibility
}
