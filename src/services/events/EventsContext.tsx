
import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventsService } from '@/services/EventsService';
import { EventType, EventPayload, EventsState } from '@/services/events/types';

const EventsContext = createContext<EventsState | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [listeners, setListeners] = useState<any[]>([]);

  const addListener = (type: EventType, callback: (payload: EventPayload) => void): string => {
    const listenerId = EventsService.addEventListener(type, callback);
    return listenerId;
  };

  const removeListener = (id: string) => {
    EventsService.removeEventListener(id);
  };

  const dispatchEvent = (type: EventType, payload?: EventPayload) => {
    EventsService.dispatchEvent(type, payload);
  };

  // Provide a subscription function that returns an unsubscribe function
  const subscribeToEvent = (type: EventType, callback: (payload: EventPayload) => void) => {
    const listenerId = addListener(type, callback);
    return () => removeListener(listenerId);
  };

  const value = {
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
