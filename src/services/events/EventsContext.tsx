
import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventsService } from '@/services/EventsService';
import { EventType, EventPayload, EventsState } from '@/services/events/types';

const EventsContext = createContext<EventsState | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [listeners, setListeners] = useState<any[]>([]);

  // Return a function that wraps addEventListener to match the expected return type
  const addListener = (type: EventType, callback: (payload: EventPayload) => void) => {
    // Get the unsubscribe function from EventsService
    const unsubscribe = EventsService.addEventListener(type, callback);
    // Return this unsubscribe function directly to match the expected return type
    return unsubscribe;
  };

  const removeListener = (unsubscribeFn: () => void) => {
    // Just execute the unsubscribe function
    if (typeof unsubscribeFn === 'function') {
      unsubscribeFn();
    }
  };

  const dispatchEvent = (type: EventType, payload?: EventPayload) => {
    EventsService.dispatchEvent(type, payload);
  };

  // Provide a subscription function that returns an unsubscribe function
  const subscribeToEvent = (type: EventType, callback: (payload: EventPayload) => void) => {
    const unsubscribe = EventsService.addEventListener(type, callback);
    return unsubscribe;
  };

  const value: EventsState = {
    listeners,
    addListener,
    removeListener,
    dispatchEvent,
    subscribeToEvent,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};
