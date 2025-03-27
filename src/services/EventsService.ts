
import { useState, useEffect } from 'react';
import { dispatchEvent } from './events/store';
import { useEventListener } from './events/hooks';
import { EVENT_TYPES } from './events/types';

// Re-export the event hooks and types for backward compatibility
export { useEventListener, EVENT_TYPES };

// Event dispatcher
export const EventsService = {
  dispatchEvent,
  useEventListener,
  EVENT_TYPES
};

export default EventsService;
