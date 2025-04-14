
export type EventType =
  | 'team-member-added'
  | 'team-member-removed'
  | 'managed-users-updated'
  | 'call-updated'
  | 'call-assigned'
  | 'transcript-updated'
  | 'sentiment-updated'
  | 'bulk-upload-status-change'
  | 'bulk-upload-completed'
  | 'bulk-upload-error'
  | 'metrics-refreshed';

export interface EventPayload {
  id?: string;
  teamMember?: any;
  teamMemberId?: string;
  callId?: string;
  transcriptId?: string;
  timestamp?: string | number;
  files?: any[];
  error?: any;
  transcripts?: any[];
  [key: string]: any;
}

export const EVENT_TYPES = {
  TEAM_MEMBER_ADDED: 'team-member-added' as EventType,
  TEAM_MEMBER_REMOVED: 'team-member-removed' as EventType,
  MANAGED_USERS_UPDATED: 'managed-users-updated' as EventType,
  CALL_UPDATED: 'call-updated' as EventType,
  CALL_ASSIGNED: 'call-assigned' as EventType,
  TRANSCRIPT_UPDATED: 'transcript-updated' as EventType,
  SENTIMENT_UPDATED: 'sentiment-updated' as EventType,
  BULK_UPLOAD_STATUS_CHANGE: 'bulk-upload-status-change' as EventType,
  BULK_UPLOAD_COMPLETED: 'bulk-upload-completed' as EventType,
  BULK_UPLOAD_ERROR: 'bulk-upload-error' as EventType,
  METRICS_REFRESHED: 'metrics-refreshed' as EventType
};
