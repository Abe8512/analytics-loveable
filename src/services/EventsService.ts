
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
  // Map to store unsubscribe functions
  private _unsubscribeFunctions = new Map<string, () => void>();
  
  dispatchEvent(type: EventType, payload?: EventPayload) {
    return EventsStore.dispatchEvent(type, payload);
  }

  addEventListener(type: EventType, listener: (payload: EventPayload) => void): string {
    // Get the unsubscribe function
    const unsubscribe = EventsStore.addEventListener(type, listener);
    
    // Generate a unique ID for this listener
    const id = `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the unsubscribe function
    this._unsubscribeFunctions.set(id, unsubscribe);
    
    return id;
  }

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
    // This is just for compatibility with existing code
    // The actual implementation uses the hook from ./events/hooks
    console.warn('Use the useEventListener hook directly instead of this method');
    return this.addEventListener(type, callback);
  }

  listen(type: EventType, callback: (payload: EventPayload) => void): string {
    // Return the string ID
    return this.addEventListener(type, callback);
  }
}

// Create a singleton instance
export const EventsService = new EventsServiceClass();

// Re-export the EVENT_TYPES from store
export { EVENT_TYPES } from './events/types';
export type { EventType, EventPayload };

export default EventsService;
