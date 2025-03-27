
// Re-export the events functionality from our events system
import { 
  dispatchEvent, 
  addEventListener, 
  removeEventListener, 
  useEventListener, 
  EVENT_TYPES,
} from './events';
import type { EventType, EventPayload } from './events/types';

// Re-export the event hooks and types for backward compatibility
export { 
  useEventListener, 
  EVENT_TYPES,
  addEventListener,
  removeEventListener,
};

// Re-export types with 'export type'
export type { EventType, EventPayload };

// Event dispatcher service
export const EventsService = {
  dispatchEvent,
  addEventListener,
  removeEventListener,
  useEventListener,
  EVENT_TYPES
};

export default EventsService;
