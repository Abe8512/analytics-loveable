
export type EventType = 
  | 'transcript-created'
  | 'transcript-updated'
  | 'transcript-deleted'
  | 'transcripts-updated'
  | 'transcripts-refreshed'
  | 'transcript-selected'
  | 'bulk-upload-started'
  | 'bulk-upload-completed'
  | 'bulk-upload-progress'
  | 'team-member-added'
  | 'team-member-removed'
  | 'team-member-selected'
  | 'team-metrics-updated'
  | 'managed-users-updated'
  | 'call-updated'
  | 'recording-completed'
  | 'sentiment-updated'
  | 'connection-restored'
  | 'connection-lost'
  | 'call-uploaded'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED'
  | 'TEAM_MEMBER_SELECTED'
  | 'TEAM_METRICS_UPDATED'
  | 'MANAGED_USERS_UPDATED'
  | 'CALL_UPDATED'
  | 'CONNECTION_RESTORED'
  | 'CONNECTION_LOST'; // Added uppercase versions for connection events

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
  subscribeToEvent?: (type: EventType, callback: (payload: EventPayload) => void) => () => void;
}

export type EventMap = Map<EventType, Set<(payload: EventPayload) => void>>;

export interface EventsStore {
  listenerMap: EventMap;
  eventHistory: EventPayload[];
  addEventListener: (type: EventType, listener: (payload: EventPayload) => void) => () => void;
  removeEventListener: (id: string) => void;
  dispatchEvent: (type: EventType, payload?: EventPayload) => void;
  getListeners: () => EventListener[];
  getEventHistory: () => EventPayload[];
  clearEventHistory: () => void;
}

export const EVENT_TYPES = {
  TEAM_MEMBER_ADDED: 'TEAM_MEMBER_ADDED' as EventType,
  TEAM_MEMBER_REMOVED: 'TEAM_MEMBER_REMOVED' as EventType,
  TEAM_MEMBER_SELECTED: 'TEAM_MEMBER_SELECTED' as EventType,
  TEAM_METRICS_UPDATED: 'TEAM_METRICS_UPDATED' as EventType,
  MANAGED_USERS_UPDATED: 'MANAGED_USERS_UPDATED' as EventType,
  CALL_UPDATED: 'CALL_UPDATED' as EventType,
  CONNECTION_RESTORED: 'CONNECTION_RESTORED' as EventType,
  CONNECTION_LOST: 'CONNECTION_LOST' as EventType,
  TRANSCRIPT_SELECTED: 'transcript-selected' as EventType,
  SENTIMENT_UPDATED: 'sentiment-updated' as EventType,
  TRANSCRIPTS_UPDATED: 'transcripts-updated' as EventType,
  TRANSCRIPTS_REFRESHED: 'transcripts-refreshed' as EventType
};
