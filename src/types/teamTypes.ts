
import { UUID } from "crypto";

// Team member types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
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
}

export interface AddTeamMemberParams {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

// Team service interface
export interface TeamServiceInterface {
  getTeamMembers: () => Promise<TeamMember[]>;
  addTeamMember: (member: AddTeamMemberParams) => Promise<TeamMember | null>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<boolean>;
  removeTeamMember: (id: string) => Promise<boolean>;
  isTeamMembersTableMissing: () => Promise<boolean>;
}
