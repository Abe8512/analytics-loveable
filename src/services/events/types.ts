
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
  | 'recording-completed'
  | 'sentiment-updated'
  | 'connection-restored'
  | 'connection-lost'
  | 'call-uploaded';  // Added this event type

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
