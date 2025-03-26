
import { toast } from 'sonner';

export interface AppError {
  message: string;
  technical?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  code?: string;
  actionable?: boolean;
  retry?: () => Promise<any>;
}

type ConnectionChangeCallback = (online: boolean) => void;

class ErrorHandler {
  private static instance: ErrorHandler;
  private connectionCallbacks: ConnectionChangeCallback[] = [];
  isOffline: boolean = false;
  
  // Track errors to avoid duplicate toasts
  private recentErrors: Map<string, number> = new Map();
  
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleConnectionChange);
      window.addEventListener('offline', this.handleConnectionChange);
      this.isOffline = !navigator.onLine;
    }
  }
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  private handleConnectionChange = () => {
    const isOnline = navigator.onLine;
    this.isOffline = !isOnline;
    this.connectionCallbacks.forEach(callback => callback(isOnline));
    
    if (isOnline) {
      toast.success('Connection restored', {
        description: 'Your internet connection is back online',
        duration: 3000,
      });
    } else {
      toast.error('Connection lost', {
        description: 'You are currently offline. Some features may be unavailable',
        duration: 5000,
      });
    }
  };
  
  onConnectionChange(callback: ConnectionChangeCallback) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Main error handling method
  handleError(error: AppError, source?: string) {
    console.error(`Error [${source}]:`, error);
    
    // Generate a key for this error to avoid duplicates
    const errorKey = `${error.code || 'unknown'}-${error.message}`;
    const now = Date.now();
    
    // Check if we've shown this error recently (within 5 seconds)
    if (this.recentErrors.has(errorKey)) {
      const lastTime = this.recentErrors.get(errorKey) || 0;
      if (now - lastTime < 5000) {
        // Skip duplicate toast
        return;
      }
    }
    
    // Store this error in recent errors
    this.recentErrors.set(errorKey, now);
    
    // Clean up old errors (older than 1 minute)
    this.recentErrors.forEach((time, key) => {
      if (now - time > 60000) {
        this.recentErrors.delete(key);
      }
    });
    
    // Show appropriate toast based on severity
    switch (error.severity) {
      case 'info':
        toast.info(error.message);
        break;
      case 'warning':
        toast.warning(error.message, {
          description: error.technical,
          duration: 5000,
        });
        break;
      case 'error':
        toast.error(error.message, {
          description: error.technical,
          duration: 7000,
          action: error.actionable && error.retry ? {
            label: "Retry",
            onClick: () => error.retry?.(),
          } : undefined,
        });
        break;
      case 'critical':
        toast.error(error.message, {
          description: error.technical,
          duration: 10000,
          action: error.actionable && error.retry ? {
            label: "Retry",
            onClick: () => error.retry?.(),
          } : undefined,
        });
        break;
      default:
        toast.error(error.message);
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage: string = 'Operation failed'
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error: any) {
      errorHandler.handleError({
        message: errorMessage,
        technical: error.message || String(error),
        severity: 'error',
        code: error.code || 'UNKNOWN_ERROR',
      });
      throw error;
    }
  };
}
