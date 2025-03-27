
import { useState, useEffect } from 'react';

// Event types
export const EVENT_TYPES = {
  TEAM_MEMBER_ADDED: 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED: 'TEAM_MEMBER_REMOVED',
  MANAGED_USERS_UPDATED: 'MANAGED_USERS_UPDATED',
  CALL_UPDATED: 'CALL_UPDATED'
};

// Event dispatcher
let listeners: { [key: string]: Function[] } = {};

export const dispatchEvent = (eventType: string, data?: any) => {
  if (!listeners[eventType]) {
    return;
  }
  
  listeners[eventType].forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error(`Error in event listener for ${eventType}:`, error);
    }
  });
};

export const addEventListener = (eventType: string, callback: Function) => {
  if (!listeners[eventType]) {
    listeners[eventType] = [];
  }
  
  listeners[eventType].push(callback);
  
  // Return a function to remove the event listener
  return () => {
    if (!listeners[eventType]) return;
    
    listeners[eventType] = listeners[eventType].filter(cb => cb !== callback);
    
    if (listeners[eventType].length === 0) {
      delete listeners[eventType];
    }
  };
};

// React hook for event listening
export const useEventListener = (eventType: string, callback: Function) => {
  useEffect(() => {
    const removeListener = addEventListener(eventType, callback);
    return removeListener;
  }, [eventType, callback]);
};

export const clearAllEventListeners = () => {
  listeners = {};
};

export const EventsService = {
  dispatchEvent,
  addEventListener,
  useEventListener,
  clearAllEventListeners,
  EVENT_TYPES
};

export default EventsService;
