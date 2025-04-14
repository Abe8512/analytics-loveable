
import { EventType, EventPayload } from './types';
import { v4 as uuidv4 } from 'uuid';

// Store for event listeners
type ListenerRecord = {
  id: string;
  type: EventType;
  callback: (payload: EventPayload) => void;
};

const listeners: ListenerRecord[] = [];
const eventHistory: {type: EventType, payload: EventPayload}[] = [];

/**
 * Register an event listener
 * @param type The event type to listen for
 * @param callback The callback to invoke when the event occurs
 * @returns A function to unregister the listener
 */
export const addEventListener = (type: EventType, callback: (payload: EventPayload) => void): () => void => {
  const id = uuidv4();
  listeners.push({ id, type, callback });
  
  // Return a function to unsubscribe
  return () => {
    const index = listeners.findIndex(listener => listener.id === id);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Remove an event listener
 * @param id The ID of the listener to remove
 */
export const removeEventListener = (id: string): void => {
  const index = listeners.findIndex(listener => listener.id === id);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
};

/**
 * Dispatch an event
 * @param type The type of event to dispatch
 * @param payload Optional payload to pass to event handlers
 */
export const dispatchEvent = (type: EventType, payload?: EventPayload): void => {
  const eventPayload = payload || {};
  
  // Store in history
  eventHistory.push({
    type, 
    payload: eventPayload
  });
  
  // Limit history to 100 events
  if (eventHistory.length > 100) {
    eventHistory.shift();
  }
  
  // Notify listeners
  listeners
    .filter(listener => listener.type === type)
    .forEach(listener => {
      try {
        listener.callback(eventPayload);
      } catch (error) {
        console.error(`Error in event listener for ${type}:`, error);
      }
    });
};

// Create an events store singleton object
export const EventsStore = {
  addEventListener,
  removeEventListener,
  dispatchEvent,
  getListeners: () => [...listeners],
  getEventHistory: () => [...eventHistory],
  clearEventHistory: () => {
    eventHistory.length = 0;
  }
};

// Re-export event constants
export const EVENT_TYPES = {
  // Add your event types here
  TEAM_MEMBER_ADDED: 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED: 'TEAM_MEMBER_REMOVED',
  TEAM_MEMBER_UPDATED: 'TEAM_MEMBER_UPDATED',
  MANAGED_USERS_UPDATED: 'MANAGED_USERS_UPDATED',
  CALL_UPDATED: 'CALL_UPDATED',
  CALL_CREATED: 'CALL_CREATED',
  CALL_DELETED: 'CALL_DELETED',
} as const;
