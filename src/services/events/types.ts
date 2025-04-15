
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
  | 'MANAGED_USERS_UPDATED'
  | 'BULK_UPLOAD_STARTED'
  | 'BULK_UPLOAD_PROGRESS'
  | 'BULK_UPLOAD_COMPLETED'
  | 'BULK_UPLOAD_ERROR'
  | 'processing-started'
  | 'processing-progress'
  | 'processing-completed'
  | 'processing-error'
  | 'CALL_UPLOADED'
  | 'transcript-created'
  | 'bulk-upload-completed'
  | 'transcripts-refreshed'
  | 'sentiment-updated'
  | 'metrics-refreshed';

export type TeamEventType = 
  | 'team-member-added'
  | 'team-member-removed';

export const EVENT_TYPES = {
  TEAM_MEMBER_ADDED: 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED: 'TEAM_MEMBER_REMOVED',
  CALL_UPDATED: 'CALL_UPDATED',
  TRANSCRIPT_UPDATED: 'TRANSCRIPT_UPDATED',
  MANAGED_USERS_UPDATED: 'MANAGED_USERS_UPDATED',
  BULK_UPLOAD_STARTED: 'BULK_UPLOAD_STARTED',
  BULK_UPLOAD_PROGRESS: 'BULK_UPLOAD_PROGRESS',
  BULK_UPLOAD_COMPLETED: 'BULK_UPLOAD_COMPLETED',
  BULK_UPLOAD_ERROR: 'BULK_UPLOAD_ERROR',
  CALL_UPLOADED: 'CALL_UPLOADED'
};

export interface EventPayload {
  [key: string]: any;
  timestamp: string;
}
