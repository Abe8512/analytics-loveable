
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
  // Map to store unsubscribe functions
  private _unsubscribeFunctions = new Map<string, () => void>();

  // Dispatch an event
  dispatchEvent(type: EventType, payload?: EventPayload) {
    return dispatchEventOriginal(type, payload);
  }

  // Add an event listener and return a string ID
  addEventListener(type: EventType, listener: (payload: EventPayload) => void): () => void {
    // The original function returns a function to unsubscribe
    const unsubscribe = addEventListenerOriginal(type, listener);
    
    // Generate a unique ID for this listener
    const id = `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the unsubscribe function
    this._unsubscribeFunctions.set(id, unsubscribe);
    
    // Return the unsubscribe function directly
    return unsubscribe;
  }

  // Remove an event listener by ID (legacy)
  removeEventListener(id: string) {
    const unsubscribe = this._unsubscribeFunctions.get(id);
    if (unsubscribe) {
      unsubscribe();
      this._unsubscribeFunctions.delete(id);
    } else {
      console.warn(`No event listener found with ID: ${id}`);
    }
  }

  // Use the hook for event listening
  useEventListener(type: EventType, callback: (payload: EventPayload) => void) {
    return useEventListener(type, callback);
  }
}

// Create a singleton instance
export const EventsService = new EventsServiceClass();

// Re-export event types and constants
export { EVENT_TYPES };
export type { EventType, EventPayload };

export default EventsService;
