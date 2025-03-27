
import { useEffect, useCallback } from 'react';
import { addEventListener, removeEventListener } from './store';
import { EventType, EventPayload } from './types';

/**
 * React hook for subscribing to events
 */
export const useEventListener = (eventType: EventType | string, callback: (payload?: EventPayload) => void) => {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const removeListener = addEventListener(eventType as EventType, memoizedCallback);
    return () => {
      if (removeListener) {
        removeListener();
      }
    };
  }, [eventType, memoizedCallback]);
};

export default { useEventListener };
