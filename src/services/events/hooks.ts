import { useEffect, useCallback, useState, useRef } from 'react';
import { EventType, EventPayload } from './types';
import { EventsStore } from './store';
import { safeCall } from '@/utils/safeFunctions';

/**
 * Hook for listening to events
 * @param type Event type to listen for
 * @param callback Callback function to execute when event is fired
 * @param dependencies Optional dependency array for the callback
 */
export function useEventListener(
  type: EventType,
  callback: (payload: EventPayload) => void,
  dependencies: any[] = []
): void {
  const callbackRef = useRef(callback);

  // Keep the callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  // Setup event listener
  useEffect(() => {
    // Wrapper function to ensure we're using the latest callback
    const eventHandler = (payload: EventPayload) => {
      safeCall(() => callbackRef.current(payload));
    };

    // Add event listener
    const unsubscribe = EventsStore.addEventListener(type, eventHandler);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [type]);
}

/**
 * Hook for dispatching events
 * @returns Function to dispatch an event
 */
export function useEventDispatcher() {
  return useCallback(
    (type: EventType, payload?: EventPayload) => {
      EventsStore.dispatchEvent(type, payload);
    },
    []
  );
}

/**
 * Hook for tracking event history
 * @param types Optional array of event types to filter by
 * @returns Array of event payloads
 */
export function useEventHistory(types?: EventType[]) {
  const eventHistory = EventsStore.getEventHistory();
  
  return types 
    ? eventHistory.filter(event => types.includes(event.type as EventType))
    : eventHistory;
}

/**
 * Hook for tracking the last event of a specific type
 * @param type Event type to track
 * @returns The last event payload of the specified type, or null if none
 */
export function useLastEvent(type: EventType) {
  const [lastEvent, setLastEvent] = useState<EventPayload | null>(null);
  
  useEventListener(
    type,
    (payload) => {
      setLastEvent(payload);
    }
  );
  
  return lastEvent;
}
