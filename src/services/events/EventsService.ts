
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

  // This should return a string ID that can be used to remove the listener
  addEventListener(type: EventType, listener: (payload: EventPayload) => void): string {
    // The original function returns a function to unsubscribe
    const unsubscribe = addEventListenerOriginal(type, listener);
    
    // Store the unsubscribe function in a map keyed by a unique ID
    const id = `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this._unsubscribeFunctions.set(id, unsubscribe);
    
    return id;
  }

  // Map to store unsubscribe functions
  private _unsubscribeFunctions = new Map<string, () => void>();

  removeEventListener(id: string) {
    const unsubscribe = this._unsubscribeFunctions.get(id);
    if (unsubscribe) {
      unsubscribe();
      this._unsubscribeFunctions.delete(id);
    } else {
      console.warn(`No event listener found with ID: ${id}`);
    }
  }

  useEventListener(type: EventType, callback: (payload: EventPayload) => void) {
    return useEventListener(type, callback);
  }

  listen(type: EventType, callback: (payload: EventPayload) => void): string {
    // Return the ID from addEventListener
    return this.addEventListener(type, callback);
  }
}

// Create a singleton instance
export const EventsService = new EventsServiceClass();

// Re-export event types and constants
export { EVENT_TYPES };
export type { EventType, EventPayload };

export default EventsService;
