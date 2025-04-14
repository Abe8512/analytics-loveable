
import { v4 as uuidv4 } from 'uuid';
import { EventType, EventPayload, EVENT_TYPES } from './types';

interface Listener {
  id: string;
  type: EventType;
  callback: (payload: EventPayload) => void;
}

class EventsStoreClass {
  private listeners: Listener[] = [];
  
  addEventListener(type: EventType, callback: (payload: EventPayload) => void): () => void {
    const id = uuidv4();
    
    // Add the listener to our array
    this.listeners.push({
      id,
      type,
      callback
    });
    
    // Return function to remove the listener
    return () => {
      this.listeners = this.listeners.filter(listener => listener.id !== id);
    };
  }
  
  removeAllListenersByType(type: EventType): void {
    this.listeners = this.listeners.filter(listener => listener.type !== type);
  }
  
  dispatchEvent(type: EventType, payload: EventPayload = {}): void {
    console.log(`[EventsStore] Dispatching event: ${type}`, payload);
    
    // Call all matching listeners
    this.listeners
      .filter(listener => listener.type === type)
      .forEach(listener => {
        try {
          listener.callback(payload);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
  }
}

// Export a singleton instance
export const EventsStore = new EventsStoreClass();

// Re-export the EVENT_TYPES
export { EVENT_TYPES };
