
import { v4 as uuidv4 } from 'uuid';
import { EventType, EventPayload, EventMap, EventsStore, EventListener } from './types';

// Create a Map to store event listeners
const listenerMap: EventMap = new Map();

// Store recent event history for debugging
const eventHistory: EventPayload[] = [];

// Add an event listener
export const addEventListener = (type: EventType, listener: (payload: EventPayload) => void) => {
  // Get the current listeners for this event type
  let listeners = listenerMap.get(type);
  
  // If no listeners exist yet, create a new set
  if (!listeners) {
    listeners = new Set();
    listenerMap.set(type, listeners);
  }
  
  // Add the listener to the set
  listeners.add(listener);
  
  // Return an unsubscribe function
  return () => {
    const currentListeners = listenerMap.get(type);
    if (currentListeners) {
      currentListeners.delete(listener);
      if (currentListeners.size === 0) {
        listenerMap.delete(type);
      }
    }
  };
};

// Remove an event listener by ID (deprecated)
export const removeEventListener = (id: string) => {
  // This method is kept for backward compatibility
  // but will be removed in the future
  console.warn('removeEventListener by ID is deprecated, use the unsubscribe function returned by addEventListener');
};

// Dispatch an event to all registered listeners
export const dispatchEvent = (type: EventType, payload: EventPayload = {}) => {
  const listeners = listenerMap.get(type);
  if (listeners) {
    listeners.forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`Error in event listener for ${type}:`, error);
      }
    });
  }
  
  // Add to history for debugging
  eventHistory.push({ ...payload, type, timestamp: Date.now() });
  if (eventHistory.length > 100) {
    eventHistory.shift(); // Keep history limited to 100 events
  }
};

// Get all listeners for debugging
export const getListeners = (): EventListener[] => {
  const result: EventListener[] = [];
  listenerMap.forEach((listeners, type) => {
    listeners.forEach(callback => {
      result.push({ id: uuidv4(), type, callback });
    });
  });
  return result;
};

// Get event history
export const getEventHistory = () => [...eventHistory];

// Clear event history
export const clearEventHistory = () => {
  eventHistory.length = 0;
};

// Export the store object
export const EventsStore: EventsStore = {
  listenerMap,
  eventHistory,
  addEventListener,
  removeEventListener,
  dispatchEvent,
  getListeners,
  getEventHistory,
  clearEventHistory
};
