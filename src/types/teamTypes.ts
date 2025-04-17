
import { UUID } from "crypto";

// Team member types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  avatar_url?: string; // Add this for consistency with components
  user_id?: string; // Add this for BulkUploadProcessorService
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamPerformance {
  active_reps: number;
  total_calls: number;
  avg_sentiment: number;
  avg_duration: number;
  positive_calls: number;
  negative_calls: number;
  
  // Add these fields to make it compatible with the rep data
  id?: string;
  name?: string;
  calls?: number;
  successRate?: number;
  conversionRate?: number;
  rep_id?: string;
  rep_name?: string;
  call_volume?: number;
  success_rate?: number;
  sentiment_score?: number;
}

export interface AddTeamMemberParams {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

// Add BulkUploadFilter interface for BulkUploadProcessor
export interface BulkUploadFilter {
  force?: boolean;
  includeProcessed?: boolean;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
}

// Team service interface
export interface TeamServiceInterface {
  getTeamMembers: () => Promise<TeamMember[]>;
  addTeamMember: (member: AddTeamMemberParams) => Promise<TeamMember | null>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<boolean>;
  removeTeamMember: (id: string) => Promise<boolean>;
  isTeamMembersTableMissing: () => Promise<boolean>;
}

// Add a helper function to safely cast data to TeamMember
export function safeTeamMemberCast(data: any): TeamMember {
  return {
    id: data.id || '',
    name: data.name || '',
    email: data.email || '',
    role: data.role,
    avatar: data.avatar,
    avatar_url: data.avatar_url || data.avatar,
    user_id: data.user_id,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at
  };
}
