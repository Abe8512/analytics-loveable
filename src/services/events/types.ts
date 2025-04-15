
// Define event types
export type EventType = 
  | 'team-member-added'
  | 'team-member-removed'
  | 'call-updated'
  | 'transcript-updated'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED'
  | 'CALL_UPDATED'
  | 'TRANSCRIPT_UPDATED'
  | 'MANAGED_USERS_UPDATED';

export type TeamEventType = 
  | 'team-member-added'
  | 'team-member-removed';

export const EVENT_TYPES = {
  TEAM_MEMBER_ADDED: 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED: 'TEAM_MEMBER_REMOVED',
  CALL_UPDATED: 'CALL_UPDATED',
  TRANSCRIPT_UPDATED: 'TRANSCRIPT_UPDATED',
  MANAGED_USERS_UPDATED: 'MANAGED_USERS_UPDATED'
};

export interface EventPayload {
  [key: string]: any;
  timestamp: string;
}
