
// Re-export the events functionality from our events system
import { 
  dispatchEvent, 
  addEventListener, 
  removeEventListener, 
  useEventListener, 
  EVENT_TYPES,
  EventType,
  EventPayload
} from './events';

// Re-export the event hooks and types for backward compatibility
export { 
  useEventListener, 
  EVENT_TYPES,
  addEventListener,
  removeEventListener,
  EventType,
  EventPayload
};

// Event dispatcher service
export const EventsService = {
  dispatchEvent,
  addEventListener,
  removeEventListener,
  useEventListener,
  EVENT_TYPES
};

export default EventsService;
