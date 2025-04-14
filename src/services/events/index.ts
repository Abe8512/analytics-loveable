
// Re-export selectively to avoid ambiguity
import { EventType, EventPayload, EVENT_TYPES } from './types';
import { dispatchEvent, addEventListener, removeEventListener } from './store';
import { useEventListener } from './hooks';
import { createEventEmitter, initEvents } from './utils';

export {
  // Types and constants
  EVENT_TYPES,
  
  // Core functions
  dispatchEvent,
  addEventListener,
  removeEventListener,
  
  // Hooks
  useEventListener,
  
  // Utilities
  createEventEmitter,
  initEvents
};

// Re-export types properly with the 'type' keyword for compatibility with isolatedModules
export type { EventType, EventPayload };

// Also export the store object itself, but rename it to avoid collision
import { EventsStore as EventsStoreOriginal } from './store';
export { EventsStoreOriginal as EventsStore };
