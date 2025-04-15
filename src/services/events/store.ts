import { v4 as uuidv4 } from 'uuid';
import { EventType, EventPayload, EVENT_TYPES } from './types';

interface Listener {
  id: string;
  type: EventType;
  callback: (payload: EventPayload) => void;
}

class EventsStoreClass {
  private listeners: Listener[] = [];
  private eventHistory: { type: EventType; payload: EventPayload; timestamp: number }[] = [];
  
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
    
    // Ensure timestamp is always present
    if (!payload.timestamp) {
      payload.timestamp = new Date().toISOString();
    }
    
    // Add to event history
    this.eventHistory.push({
      type,
      payload,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(-100);
    }
    
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
  
  getEventHistory() {
    return [...this.eventHistory];
  }
}

// Export a singleton instance
export const EventsStore = new EventsStoreClass();

// Re-export the EVENT_TYPES
export { EVENT_TYPES };

// Export the core functions
export const dispatchEvent = (eventType: string, data: any = {}) => {
  // Ensure timestamp is included in every event payload
  const eventData = {
    ...data,
    timestamp: data.timestamp || new Date().toISOString()
  };
  
  console.log(`[EventsStore] Dispatching event: ${eventType}`, eventData);
  
  // Ensure timestamp is always present
  if (!eventData.timestamp) {
    eventData.timestamp = new Date().toISOString();
  }
  
  // Add to event history
  EventsStore.eventHistory.push({
    type: eventType,
    payload: eventData,
    timestamp: Date.now()
  });
  
  // Limit history size
  if (EventsStore.eventHistory.length > 100) {
    EventsStore.eventHistory = EventsStore.eventHistory.slice(-100);
  }
  
  // Call all matching listeners
  EventsStore.listeners
    .filter(listener => listener.type === eventType)
    .forEach(listener => {
      try {
        listener.callback(eventData);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });
};

export const addEventListener = (type: EventType, callback: (payload: EventPayload) => void) => 
  EventsStore.addEventListener(type, callback);

export const removeEventListener = (unsubscribeFn: () => void) => {
  if (typeof unsubscribeFn === 'function') {
    unsubscribeFn();
  }
};
