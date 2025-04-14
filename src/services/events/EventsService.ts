
import { 
  dispatchEvent as dispatchEventOriginal, 
  addEventListener as addEventListenerOriginal, 
  removeEventListener as removeEventListenerOriginal,
  EVENT_TYPES
} from './store';
import type { EventType, EventPayload } from './types';
import { useEventListener } from './hooks';

// Create a proper EventsService class to match the imports in other files
class EventsServiceClass {
  dispatchEvent(type: EventType, payload?: EventPayload) {
    return dispatchEventOriginal(type, payload);
  }

  addEventListener(type: EventType, listener: (payload: EventPayload) => void): string {
    return addEventListenerOriginal(type, listener);
  }

  removeEventListener(id: string) {
    removeEventListenerOriginal(id);
  }

  useEventListener(type: EventType, callback: (payload: EventPayload) => void) {
    return useEventListener(type, callback);
  }

  listen(type: EventType, callback: (payload: EventPayload) => void): string {
    // Return the unsubscribe function for easier cleanup
    return this.addEventListener(type, callback);
  }
}

// Create a singleton instance
export const EventsService = new EventsServiceClass();

// Re-export event types and constants
export { EVENT_TYPES };
export type { EventType, EventPayload };

export default EventsService;
