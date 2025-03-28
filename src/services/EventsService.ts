
/**
 * Event Service
 * 
 * This file re-exports the events functionality from our events system
 * to provide a consistent interface for components.
 */
import EventsService from './events/EventsService';

// Re-export everything from the underlying implementation
export * from './events/EventsService';

// Export the default implementation
export default EventsService;
