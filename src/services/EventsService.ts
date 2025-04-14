
/**
 * Event Service
 * 
 * This file re-exports the events functionality from our events system
 * to provide a consistent interface for components.
 */
import { EventType, EventPayload } from './events/types';
import { EventsStore } from './events/store';

// Create a proper EventsService class to match the imports in other files
class EventsServiceClass {
  dispatchEvent(type: EventType, payload?: EventPayload) {
    return EventsStore.dispatchEvent(type, payload);
  }

  addEventListener(type: EventType, listener: (payload: EventPayload) => void) {
    return EventsStore.addEventListener(type, listener);
  }

  removeEventListener(id: string) {
    EventsStore.removeEventListener(id);
  }

  useEventListener(type: EventType, callback: (payload: EventPayload) => void) {
    // This is just for compatibility with existing code
    // The actual implementation uses the hook from ./events/hooks
    console.warn('Use the useEventListener hook directly instead of this method');
    return this.addEventListener(type, callback);
  }

  listen(type: EventType, callback: (payload: EventPayload) => void) {
    // Return the unsubscribe function for easier cleanup
    return this.addEventListener(type, callback);
  }
}

// Create a singleton instance
export const EventsService = new EventsServiceClass();

// Re-export the EVENT_TYPES from store
export { EVENT_TYPES } from './events/store';
export type { EventType, EventPayload };

export default EventsService;
