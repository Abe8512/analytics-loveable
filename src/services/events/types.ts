export type EventType = 
  | 'transcript-created'
  | 'transcript-updated'
  | 'transcript-deleted'
  | 'transcripts-updated'
  | 'transcripts-refreshed'
  | 'bulk-upload-started'
  | 'bulk-upload-completed'
  | 'bulk-upload-progress'
  | 'team-member-added'
  | 'team-member-removed'
  | 'managed-users-updated'
  | 'call-updated'
  | 'call-assigned'
  | 'recording-completed'
  | 'sentiment-updated'
  | 'connection-restored'
  | 'connection-lost'
  | 'call-uploaded'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED'
  | 'MANAGED_USERS_UPDATED'
  | 'CALL_UPDATED'
  | 'TEAM_DATA_UPDATED'
  | 'CALL_ASSIGNED';

export interface EventPayload {
  [key: string]: any;
}

export interface EventListener {
  id: string;
  type: EventType;
  callback: (payload: EventPayload) => void;
}

export interface EventsState {
  listeners: EventListener[];
  addListener: (type: EventType, callback: (payload: EventPayload) => void) => string;
  removeListener: (id: string) => void;
  dispatchEvent: (type: EventType, payload?: EventPayload) => void;
}

// Separating EventMap from EventsStore to fix typing issues
export type EventMap = Map<EventType, Set<(payload: EventPayload) => void>>;

export interface EventsStore extends EventsState {
  listenerMap: EventMap;
  eventHistory: EventPayload[];
  addEventListener: (type: EventType, listener: (payload: EventPayload) => void) => () => void;
  removeEventListener: (type: EventType, listener: (payload: EventPayload) => void) => void;
  clearEventHistory: () => void;
}

// Export EVENT_TYPES constant for backward compatibility
export const EVENT_TYPES = {
  TEAM_MEMBER_ADDED: 'team-member-added' as EventType,
  TEAM_MEMBER_REMOVED: 'team-member-removed' as EventType,
  MANAGED_USERS_UPDATED: 'managed-users-updated' as EventType,
  CALL_UPDATED: 'call-updated' as EventType,
  CALL_ASSIGNED: 'call-assigned' as EventType,
  TEAM_DATA_UPDATED: 'team-data-updated' as EventType
};
