
import { useState, useEffect, useCallback } from 'react';
import { checkSupabaseConnection, isConnected as checkSupabaseConnected } from '@/integrations/supabase/client';
import { useEventsStore } from '@/services/events';
import { errorHandler } from './ErrorHandlingService';
import { connectionUtils } from '@/utils/connectionUtils';

// Constants for connection checking
const CONNECTION_CHECK_INTERVAL = 20000; // 20 seconds
const CONNECTION_CHECK_DEBOUNCE = 5000; // 5 seconds
const MIN_EVENT_INTERVAL = 5000; // Minimum time between connection events

// Create a class to handle connection monitoring outside of React components
class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private isConnected: boolean = false;
  private lastChecked: number | null = null;
  private isCheckingConnection: boolean = false;
  private connectionCheckTimeoutId: number | null = null;
  private connectionListeners: ((isConnected: boolean) => void)[] = [];
  
  private constructor() {
    // Initialize with the current connection status
    this.isConnected = checkSupabaseConnected();
    
    // Set up browser event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      window.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('supabase-connection-restored', this.handleSupabaseConnectionRestored);
      window.addEventListener('supabase-connection-lost', this.handleSupabaseConnectionLost);
      
      // Schedule initial connection check
      setTimeout(() => this.checkConnection(), 500);
    }
    
    // Subscribe to connection changes from error handler
    errorHandler.onConnectionChange(this.handleConnectionChange);
  }
  
  public static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }
  
  /**
   * Check the connection to the database
   */
  public checkConnection = async (force = false): Promise<{connected: boolean, error: any}> => {
    // Don't check if we're already checking, unless forced
    if (this.isCheckingConnection && !force) {
      return { connected: this.isConnected, error: null };
    }

    try {
      this.isCheckingConnection = true;
      
      // Clear any pending check
      if (this.connectionCheckTimeoutId) {
        clearTimeout(this.connectionCheckTimeoutId);
        this.connectionCheckTimeoutId = null;
      }

      console.log('Checking connection status...');
      const result = await checkSupabaseConnection();
      
      // Update state only if changed
      if (this.isConnected !== result.connected) {
        console.log(`Connection state changing to: ${result.connected ? 'connected' : 'disconnected'}`);
        this.isConnected = result.connected;
        this.lastChecked = Date.now();
        
        // Notify all listeners about the change
        this.notifyListeners();
        
        // Dispatch global event
        const eventName = result.connected ? 'connection-restored' : 'connection-lost';
        const dispatchEvent = useEventsStore.getState().dispatchEvent;
        dispatchEvent(eventName);
      }
      
      this.isCheckingConnection = false;
      return result;
    } catch (err) {
      console.error('Error checking connection status:', err);
      if (this.isConnected) {
        this.isConnected = false;
        this.lastChecked = Date.now();
        this.notifyListeners();
        
        // Dispatch global event
        const dispatchEvent = useEventsStore.getState().dispatchEvent;
        dispatchEvent('connection-lost');
      }
      this.isCheckingConnection = false;
      return { connected: false, error: err };
    }
  }
  
  /**
   * Add a listener for connection status changes
   */
  public addListener = (listener: (isConnected: boolean) => void): (() => void) => {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Get the current connection status
   */
  public getConnectionStatus = (): { isConnected: boolean, lastChecked: number | null } => {
    return {
      isConnected: this.isConnected,
      lastChecked: this.lastChecked
    };
  }
  
  /**
   * Schedule regular connection checks
   */
  public scheduleConnectionChecks = (): (() => void) => {
    const scheduleNextCheck = () => {
      if (this.connectionCheckTimeoutId) {
        clearTimeout(this.connectionCheckTimeoutId);
      }
      
      this.connectionCheckTimeoutId = window.setTimeout(() => {
        // Only check if the page is visible to avoid unnecessary checks
        if (document.visibilityState === 'visible') {
          this.checkConnection().finally(() => {
            scheduleNextCheck();
          });
        } else {
          scheduleNextCheck();
        }
      }, CONNECTION_CHECK_INTERVAL);
    };
    
    scheduleNextCheck();
    
    // Return cleanup function
    return () => {
      if (this.connectionCheckTimeoutId) {
        clearTimeout(this.connectionCheckTimeoutId);
        this.connectionCheckTimeoutId = null;
      }
    };
  }
  
  /**
   * Notify all listeners about connection status changes
   */
  private notifyListeners = (): void => {
    this.connectionListeners.forEach(listener => {
      try {
        listener(this.isConnected);
      } catch (err) {
        console.error('Error in connection listener:', err);
      }
    });
  }
  
  /**
   * Handle browser online event
   */
  private handleOnline = (): void => {
    console.log('Browser reports online status');
    // Don't immediately trust the browser - verify with a real connection check
    connectionUtils.debounceConnectionChange(() => {
      this.checkConnection(true);
    }, CONNECTION_CHECK_DEBOUNCE);
  }
  
  /**
   * Handle browser offline event
   */
  private handleOffline = (): void => {
    console.log('Browser reports offline status');
    if (this.isConnected) {
      this.isConnected = false;
      this.lastChecked = Date.now();
      this.notifyListeners();
      
      // Dispatch global event
      const dispatchEvent = useEventsStore.getState().dispatchEvent;
      dispatchEvent('connection-lost');
    }
  }
  
  /**
   * Handle visibility change event
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      // When tab becomes visible, check connection if it's been a while
      const now = Date.now();
      if (this.lastChecked === null || now - this.lastChecked > CONNECTION_CHECK_INTERVAL) {
        console.log('Tab visible, checking connection...');
        this.checkConnection();
      }
    }
  }
  
  /**
   * Handle Supabase connection restored event
   */
  private handleSupabaseConnectionRestored = (): void => {
    console.log('Supabase connection restored');
    if (!this.isConnected) {
      this.isConnected = true;
      this.lastChecked = Date.now();
      this.notifyListeners();
      
      // Dispatch global event
      const dispatchEvent = useEventsStore.getState().dispatchEvent;
      dispatchEvent('connection-restored');
    }
  }
  
  /**
   * Handle Supabase connection lost event
   */
  private handleSupabaseConnectionLost = (): void => {
    console.log('Supabase connection lost');
    if (this.isConnected) {
      this.isConnected = false;
      this.lastChecked = Date.now();
      this.notifyListeners();
      
      // Dispatch global event
      const dispatchEvent = useEventsStore.getState().dispatchEvent;
      dispatchEvent('connection-lost');
    }
  }
  
  /**
   * Handle connection change from error handler
   */
  private handleConnectionChange = (online: boolean): void => {
    if (this.isConnected !== online) {
      console.log(`Connection state reported by error handler: ${online ? 'online' : 'offline'}`);
      this.isConnected = online;
      this.lastChecked = Date.now();
      this.notifyListeners();
      
      // Dispatch global event
      const dispatchEvent = useEventsStore.getState().dispatchEvent;
      dispatchEvent(online ? 'connection-restored' : 'connection-lost');
    }
  }
  
  /**
   * Cleanup all event listeners
   */
  public cleanup = (): void => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      window.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('supabase-connection-restored', this.handleSupabaseConnectionRestored);
      window.removeEventListener('supabase-connection-lost', this.handleSupabaseConnectionLost);
    }
    
    if (this.connectionCheckTimeoutId) {
      clearTimeout(this.connectionCheckTimeoutId);
      this.connectionCheckTimeoutId = null;
    }
  }
}

// Create the singleton instance
const connectionMonitor = ConnectionMonitor.getInstance();

/**
 * React hook to use the connection status in components
 */
export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(connectionMonitor.getConnectionStatus().isConnected);
  const [lastChecked, setLastChecked] = useState<number | null>(connectionMonitor.getConnectionStatus().lastChecked);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);

  // Subscribe to connection status changes
  useEffect(() => {
    const updateStatus = () => {
      const status = connectionMonitor.getConnectionStatus();
      setIsConnected(status.isConnected);
      setLastChecked(status.lastChecked);
    };
    
    // Initial status
    updateStatus();
    
    // Subscribe to changes
    const unsubscribe = connectionMonitor.addListener((connected) => {
      setIsConnected(connected);
      setLastChecked(connectionMonitor.getConnectionStatus().lastChecked);
    });
    
    // Schedule regular connection checks
    const cleanupScheduler = connectionMonitor.scheduleConnectionChecks();
    
    return () => {
      unsubscribe();
      cleanupScheduler();
    };
  }, []);
  
  // Wrapper for checkConnection to update local state
  const checkConnection = useCallback(async (force = false) => {
    setIsCheckingConnection(true);
    try {
      const result = await connectionMonitor.checkConnection(force);
      setIsCheckingConnection(false);
      return result;
    } catch (error) {
      setIsCheckingConnection(false);
      throw error;
    }
  }, []);
  
  return {
    isConnected,
    lastChecked,
    isCheckingConnection,
    checkConnection
  };
};
