
import { create } from 'zustand';
import { EventType, EventPayload, EventListener, EventsState, EventsStore, EventMap, EVENT_TYPES } from './types';

// Create events store
export const useEventsStore = create<EventsStore>((set, get) => ({
  listeners: [], // Array of event listeners
  listenerMap: new Map<EventType, Set<(payload: EventPayload) => void>>(), // Map for efficient event dispatch
  eventHistory: [],
  
  addEventListener: (type, listener) => {
    const listenerMap = get().listenerMap;
    
    if (!listenerMap.has(type)) {
      listenerMap.set(type, new Set());
    }
    
    const listenerSet = listenerMap.get(type);
    if (listenerSet) {
      listenerSet.add(listener);
    }
    
    set({ listenerMap: new Map(listenerMap) });
    
    // Return unsubscribe function
    return () => {
      get().removeEventListener(type, listener);
    };
  },
  
  removeEventListener: (type, listener) => {
    const listenerMap = get().listenerMap;
    const listenerSet = listenerMap.get(type);
    
    if (listenerSet) {
      listenerSet.delete(listener);
      set({ listenerMap: new Map(listenerMap) });
    }
  },
  
  dispatchEvent: (type, data) => {
    const event: EventPayload = {
      type,
      data,
      timestamp: Date.now()
    };
    
    // Store event in history
    set(state => ({
      eventHistory: [...state.eventHistory.slice(-100), event] // Keep last 100 events
    }));
    
    // Notify listeners using the map
    const listenerSet = get().listenerMap.get(type);
    if (listenerSet) {
      listenerSet.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error);
        }
      });
    }
    
    // Also dispatch the event to the window as a CustomEvent
    const customEvent = new CustomEvent(`app:${type}`, { detail: event });
    window.dispatchEvent(customEvent);
    
    console.log(`Event dispatched: ${type}`, data);
  },
  
  clearEventHistory: () => {
    set({ eventHistory: [] });
  },
  
  // Add these methods to satisfy the EventsState interface
  addListener: (type, callback) => {
    const id = Math.random().toString(36).substring(2, 9);
    const listener: EventListener = { id, type, callback };
    
    set(state => {
      const newListeners = [...state.listeners, listener];
      return { listeners: newListeners };
    });
    
    // Also add to the map for efficiency
    const listenerMap = get().listenerMap;
    if (!listenerMap.has(type)) {
      listenerMap.set(type, new Set());
    }
    
    const listenerSet = listenerMap.get(type);
    if (listenerSet) {
      listenerSet.add(callback);
    }
    
    set({ listenerMap: new Map(listenerMap) });
    
    return id;
  },
  
  removeListener: (id) => {
    const state = get();
    const listenerToRemove = state.listeners.find(listener => listener.id === id);
    
    if (listenerToRemove) {
      // Remove from array
      set(state => ({
        listeners: state.listeners.filter(listener => listener.id !== id)
      }));
      
      // Also remove from map
      const listenerMap = state.listenerMap;
      const listenerSet = listenerMap.get(listenerToRemove.type);
      if (listenerSet) {
        listenerSet.delete(listenerToRemove.callback);
        set({ listenerMap: new Map(listenerMap) });
      }
    }
  }
}));

// Export the key functions for external use
export const addEventListener = useEventsStore.getState().addEventListener;
export const removeEventListener = useEventsStore.getState().removeEventListener;
export const dispatchEvent = useEventsStore.getState().dispatchEvent;
export const addListener = useEventsStore.getState().addListener;
export const removeListener = useEventsStore.getState().removeListener;

// Re-export the EVENT_TYPES constant
export { EVENT_TYPES };
