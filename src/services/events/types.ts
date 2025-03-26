
export type EventType = 
  | 'transcript-created'
  | 'transcript-updated'
  | 'transcript-deleted'
  | 'transcripts-updated'
  | 'transcripts-refreshed'
  | 'bulk-upload-started'
  | 'bulk-upload-completed'
  | 'team-member-added'
  | 'team-member-removed'
  | 'managed-users-updated'
  | 'call-updated'
  | 'transcriptions-updated';

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

// Use EventsState instead of creating a new type
export type EventsStore = EventsState & {
  listeners: Map<EventType, Set<EventListener>>;
  eventHistory: EventPayload[];
  addEventListener: (type: EventType, listener: (payload: EventPayload) => void) => () => void;
  removeEventListener: (type: EventType, listener: (payload: EventPayload) => void) => void;
  clearEventHistory: () => void;
};
