
import { useEffect } from 'react';
import { addEventListener } from './store';
import { EventType, EventPayload } from './types';

/**
 * React hook for subscribing to events
 */
export const useEventListener = (eventType: EventType | string, callback: (payload?: EventPayload) => void) => {
  useEffect(() => {
    const removeListener = addEventListener(eventType as EventType, callback);
    return removeListener;
  }, [eventType, callback]);
};

export default { useEventListener };
