
import { useEffect } from 'react';
import { create } from 'zustand';

export type EventType = 
  | 'team-member-added'
  | 'team-member-removed'
  | 'managed-users-updated'
  | 'call-updated'
  | 'connection-restored'
  | 'connection-lost'
  | 'transcript-created'
  | 'bulk-upload-completed'
  | 'recording-completed';

interface EventsState {
  events: Map<EventType, any[]>;
  lastEvent: { type: EventType; payload: any } | null;
  dispatchEvent: (type: EventType, payload?: any) => void;
  subscribeToEvent: (type: EventType, callback: (payload: any) => void) => () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: new Map(),
  lastEvent: null,
  dispatchEvent: (type, payload = {}) => {
    const { events } = get();
    const currentEvents = events.get(type) || [];
    events.set(type, [...currentEvents, payload]);
    
    set({
      events,
      lastEvent: { type, payload }
    });
    
    console.log('Event dispatched:', type, payload);
    
    // Also dispatch as a DOM event for broader compatibility
    if (typeof window !== 'undefined') {
      const event = new CustomEvent(type, { detail: payload });
      window.dispatchEvent(event);
    }
  },
  subscribeToEvent: (type, callback) => {
    const handler = (evt: CustomEvent) => callback(evt.detail);
    window.addEventListener(type, handler as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener(type, handler as EventListener);
    };
  }
}));

export const useEventListener = (eventType: EventType, callback: (payload: any) => void) => {
  useEffect(() => {
    const unsubscribe = useEventsStore.getState().subscribeToEvent(eventType, callback);
    return unsubscribe;
  }, [eventType, callback]);
};
