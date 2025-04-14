
import React, { createContext, useContext, useState } from 'react';
import { EventsService } from '@/services/EventsService';
import { EventType, EventPayload, EventsState } from '@/services/events/types';

const EventsContext = createContext<EventsState | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [listeners, setListeners] = useState<any[]>([]);

  // Return a function that wraps addEventListener to match the expected return type
  const addListener = (type: EventType, callback: (payload: EventPayload) => void) => {
    // Get the unsubscribe function from EventsService
    const unsubscribe = EventsService.addEventListener(type, callback);
    
    // Use a string ID for backward compatibility
    const id = Math.random().toString(36).substring(2, 9);
    
    // Store the mapping between ID and unsubscribe function
    const listenerInfo = { id, unsubscribe };
    setListeners(prev => [...prev, listenerInfo]);
    
    // Return the ID
    return id;
  };

  const removeListener = (id: string) => {
    // Find the listener by ID
    const listener = listeners.find(l => l.id === id);
    
    // Call the unsubscribe function if found
    if (listener && typeof listener.unsubscribe === 'function') {
      listener.unsubscribe();
    }
    
    // Remove from listeners array
    setListeners(prev => prev.filter(l => l.id !== id));
  };

  const dispatchEvent = (type: EventType, payload?: EventPayload) => {
    EventsService.dispatchEvent(type, payload);
  };

  // Provide a subscription function that matches the required signature
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
