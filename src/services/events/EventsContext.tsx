
import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventsService } from '@/services/EventsService';
import { EventType, EventPayload, EventsState } from '@/services/events/types';

const EventsContext = createContext<EventsState | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [listeners, setListeners] = useState<any[]>([]);

  const addListener = (type: EventType, callback: (payload: EventPayload) => void) => {
    const unsubscribe = EventsService.addEventListener(type, callback);
    // Generate a unique ID for this listener that can be used to remove it
    const id = `listener-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return id;
  };

  const removeListener = (id: string) => {
    // This is now just a placeholder since we're changing the system
    // The actual removal will happen through the unsubscribe function returned by addEventListener
    console.log(`Removing listener with ID: ${id}`);
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
