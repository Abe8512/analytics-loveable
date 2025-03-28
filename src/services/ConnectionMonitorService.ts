import { useState, useEffect, useCallback, useRef } from 'react';
import { checkSupabaseConnection, isConnected as checkSupabaseConnected } from '@/integrations/supabase/client';
import { useEventsStore } from '@/services/events';
import { errorHandler } from './ErrorHandlingService';
import { connectionUtils } from '@/utils/connectionUtils';

// Debounce connections to prevent flapping
const CONNECTION_CHECK_INTERVAL = 20000; // 20 seconds
const CONNECTION_CHECK_DEBOUNCE = 5000; // 5 seconds

export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(checkSupabaseConnected());
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const connectionCheckTimeoutRef = useRef<number | null>(null);
  const dispatchEvent = useEventsStore.getState().dispatchEvent;
  const connectionStateRef = useRef<boolean>(isConnected);

  // Keep the connection state updated in the ref for event handlers
  useEffect(() => {
    connectionStateRef.current = isConnected;
  }, [isConnected]);

  const debouncedSetConnectionState = useCallback((state: boolean) => {
    // Only update if state has changed and isn't already being checked
    if (connectionStateRef.current !== state && !isCheckingConnection) {
      console.log(`Connection state changing to: ${state ? 'connected' : 'disconnected'}`);
      setIsConnected(state);
      setLastChecked(Date.now());
      dispatchEvent(state ? 'connection-restored' : 'connection-lost');
    }
  }, [dispatchEvent, isCheckingConnection]);

  const checkConnection = useCallback(async (force = false) => {
    // Don't check if we're already checking, unless forced
    if (isCheckingConnection && !force) {
      return { connected: connectionStateRef.current, error: null };
    }

    try {
      setIsCheckingConnection(true);
      
      // Clear any pending check
      if (connectionCheckTimeoutRef.current) {
        clearTimeout(connectionCheckTimeoutRef.current);
        connectionCheckTimeoutRef.current = null;
      }

      console.log('Checking connection status...');
      const result = await checkSupabaseConnection();
      
      // Use debouncing to prevent connection flapping
      debouncedSetConnectionState(result.connected);
      
      setIsCheckingConnection(false);
      return result;
    } catch (err) {
      console.error('Error checking connection status:', err);
      debouncedSetConnectionState(false);
      setIsCheckingConnection(false);
      return { connected: false, error: err };
    }
  }, [debouncedSetConnectionState, isCheckingConnection]);

  // Schedule regular connection checks
  useEffect(() => {
    const scheduleNextCheck = () => {
      if (connectionCheckTimeoutRef.current) {
        clearTimeout(connectionCheckTimeoutRef.current);
      }
      
      connectionCheckTimeoutRef.current = window.setTimeout(() => {
        // Only check if the page is visible to avoid unnecessary checks
        if (document.visibilityState === 'visible') {
          checkConnection().finally(() => {
            scheduleNextCheck();
          });
        } else {
          scheduleNextCheck();
        }
      }, CONNECTION_CHECK_INTERVAL);
    };

    // Initial check
    checkConnection().finally(() => {
      scheduleNextCheck();
    });

    // Cleanup
    return () => {
      if (connectionCheckTimeoutRef.current) {
        clearTimeout(connectionCheckTimeoutRef.current);
        connectionCheckTimeoutRef.current = null;
      }
    };
  }, [checkConnection]);

  // Event listeners for connection changes
  useEffect(() => {
    // Track the last event time to prevent duplicate events
    const lastEventTimeRef = useRef<number>(0);
    const MIN_EVENT_INTERVAL = 5000; // 5 seconds between events

    const handleOnline = () => {
      const now = Date.now();
      if (now - lastEventTimeRef.current > MIN_EVENT_INTERVAL) {
        lastEventTimeRef.current = now;
        console.log('Browser reports online status');
        // Don't immediately trust the browser - verify with a real connection check
        connectionUtils.debounceConnectionChange(() => {
          checkConnection(true);
        }, CONNECTION_CHECK_DEBOUNCE);
      }
    };

    const handleOffline = () => {
      const now = Date.now();
      if (now - lastEventTimeRef.current > MIN_EVENT_INTERVAL) {
        lastEventTimeRef.current = now;
        console.log('Browser reports offline status');
        debouncedSetConnectionState(false);
      }
    };

    const handleSupabaseConnectionRestored = () => {
      const now = Date.now();
      if (now - lastEventTimeRef.current > MIN_EVENT_INTERVAL) {
        lastEventTimeRef.current = now;
        console.log('Supabase connection restored');
        debouncedSetConnectionState(true);
      }
    };

    const handleSupabaseConnectionLost = () => {
      const now = Date.now();
      if (now - lastEventTimeRef.current > MIN_EVENT_INTERVAL) {
        lastEventTimeRef.current = now;
        console.log('Supabase connection lost');
        debouncedSetConnectionState(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible, check connection if it's been a while
        const now = Date.now();
        if (lastChecked === null || now - lastChecked > CONNECTION_CHECK_INTERVAL) {
          console.log('Tab visible, checking connection...');
          checkConnection();
        }
      }
    };

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for Supabase-specific connection events
    window.addEventListener('supabase-connection-restored', handleSupabaseConnectionRestored);
    window.addEventListener('supabase-connection-lost', handleSupabaseConnectionLost);

    // Subscribe to connection status changes from the error handler
    const unsubscribe = errorHandler.onConnectionChange((online) => {
      if (online !== connectionStateRef.current) {
        debouncedSetConnectionState(online);
      }
    });

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('supabase-connection-restored', handleSupabaseConnectionRestored);
      window.removeEventListener('supabase-connection-lost', handleSupabaseConnectionLost);
      unsubscribe();
    };
  }, [checkConnection, debouncedSetConnectionState, lastChecked]);

  return { 
    isConnected, 
    lastChecked, 
    isCheckingConnection,
    checkConnection 
  };
};
