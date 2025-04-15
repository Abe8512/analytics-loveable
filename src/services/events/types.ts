
/**
 * Event types for the application
 */
export const EVENT_TYPES = {
  TEAM_MEMBER_ADDED: 'team-member-added',
  TEAM_MEMBER_REMOVED: 'team-member-removed',
  CALL_UPDATED: 'call-updated',
  TRANSCRIPT_UPDATED: 'transcript-updated',
  MANAGED_USERS_UPDATED: 'managed-users-updated',
  BULK_UPLOAD_STARTED: 'bulk-upload-started',
  BULK_UPLOAD_PROGRESS: 'bulk-upload-progress',
  BULK_UPLOAD_COMPLETED: 'bulk-upload-completed',
  BULK_UPLOAD_ERROR: 'bulk-upload-error',
  CALL_UPLOADED: 'call-uploaded',
  TRANSCRIPT_CREATED: 'transcript-created',
  TRANSCRIPTS_UPDATED: 'transcripts-updated',
  TRANSCRIPTS_REFRESHED: 'transcripts-refreshed',
  SENTIMENT_UPDATED: 'sentiment-updated',
  METRICS_REFRESHED: 'metrics-refreshed'
};

export type EventType = 
  | 'team-member-added'
  | 'team-member-removed'
  | 'call-updated'
  | 'transcript-updated'
  | 'managed-users-updated'
  | 'bulk-upload-started'
  | 'bulk-upload-progress'
  | 'bulk-upload-completed' 
  | 'bulk-upload-error'
  | 'call-uploaded'
  | 'transcript-created'
  | 'transcripts-updated'
  | 'transcripts-refreshed'
  | 'sentiment-updated'
  | 'metrics-refreshed'
  | 'transcript-selected';

export interface EventPayload {
  timestamp: string;
  [key: string]: any;
}

export interface EventListener {
  eventType: string;
  callback: (data?: any) => void;
  id: string;
}
