
import { EventType } from './types';
import { EventsStore } from './store';

// Helper to create an event emitter for a specific component
export const createEventEmitter = (prefix: string) => {
  const emitter = (type: string, data?: any) => {
    EventsStore.dispatchEvent(`${prefix}-${type}` as EventType, data);
  };
  
  return emitter;
};

// Initialize the event system by importing this file
export const initEvents = () => {
  console.log('Events system initialized');
};

// Call initEvents to ensure the event system is initialized
initEvents();
