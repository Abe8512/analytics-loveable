
import React, { createContext, useContext, useState } from 'react';
import { EventsService } from '@/services/EventsService';
import { EventType, EventPayload, EventsState } from '@/services/events/types';

const EventsContext = createContext<EventsState | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [listeners, setListeners] = useState<{ id: string; unsubscribe: () => void }[]>([]);

  // Add listener and return the unsubscribe function
  const addListener = (type: EventType, callback: (payload: EventPayload) => void) => {
    // Get the unsubscribe function from EventsService
    const unsubscribe = EventsService.addEventListener(type, callback);
    
    // Create a unique ID for this listener
    const id = Math.random().toString(36).substring(2, 9);
    
    // Store the mapping between ID and unsubscribe function
    const listenerInfo = { id, unsubscribe };
    setListeners(prev => [...prev, listenerInfo]);
    
    // Return the unsubscribe function
    return unsubscribe;
  };

  const removeListener = (unsubscribeFn: () => void) => {
    // Find the listener by unsubscribe function
    const listener = listeners.find(l => l.unsubscribe === unsubscribeFn);
    
    // Call the unsubscribe function
    if (typeof unsubscribeFn === 'function') {
      unsubscribeFn();
    }
    
    // Remove from listeners array if found
    if (listener) {
      setListeners(prev => prev.filter(l => l.id !== listener.id));
    }
  };

  const dispatchEvent = (type: EventType, payload?: EventPayload) => {
    EventsService.dispatchEvent(type, payload);
  };

  // Provide a subscription function
  const subscribeToEvent = (type: EventType, callback: (payload: EventPayload) => void) => {
    return EventsService.addEventListener(type, callback);
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
