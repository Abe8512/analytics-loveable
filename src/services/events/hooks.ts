import { useEffect, useCallback, useState, useRef } from 'react';
import { EventType, EventPayload } from './types';
import { useEventsStore } from './store';
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
  const { addEventListener, removeEventListener } = useEventsStore(state => ({
    addEventListener: state.addEventListener,
    removeEventListener: state.removeEventListener
  }));

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
    const unsubscribe = addEventListener(type, eventHandler);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [type, addEventListener, removeEventListener]);
}

/**
 * Hook for dispatching events
 * @returns Function to dispatch an event
 */
export function useEventDispatcher() {
  const dispatchEvent = useEventsStore(state => state.dispatchEvent);
  
  return useCallback(
    (type: EventType, payload?: EventPayload) => {
      dispatchEvent(type, payload);
    },
    [dispatchEvent]
  );
}

/**
 * Hook for tracking event history
 * @param types Optional array of event types to filter by
 * @returns Array of event payloads
 */
export function useEventHistory(types?: EventType[]) {
  const eventHistory = useEventsStore(state => state.eventHistory);
  
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
