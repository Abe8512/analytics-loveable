
import { toast } from "@/hooks/use-toast";

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorOptions {
  severity?: ErrorSeverity;
  context?: Record<string, any>;
  userMessage?: string;
  showToast?: boolean;
}

/**
 * Standardized error handling utility for consistent error management
 * across all services in the application
 */
export const handleError = (
  error: unknown,
  source: string,
  options: ErrorOptions = {}
): void => {
  const {
    severity = 'medium',
    context = {},
    userMessage = 'An error occurred. Please try again.',
    showToast = true
  } = options;
  
  // Extract error message
  let errorMessage = 'Unknown error';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as any).message);
  }
  
  // Format context for logging
  const contextString = Object.keys(context).length > 0
    ? `\nContext: ${JSON.stringify(context, null, 2)}`
    : '';
  
  // Log based on severity
  const logPrefix = `[${source}] Error (${severity})`;
  
  switch (severity) {
    case 'critical':
      console.error(`${logPrefix}: ${errorMessage}${contextString}`, error);
      break;
    case 'high':
      console.error(`${logPrefix}: ${errorMessage}${contextString}`, error);
      break;
    case 'medium':
      console.warn(`${logPrefix}: ${errorMessage}${contextString}`, error);
      break;
    case 'low':
      console.info(`${logPrefix}: ${errorMessage}${contextString}`, error);
      break;
  }
  
  // Show toast if enabled
  if (showToast) {
    toast({
      title: severity === 'critical' ? 'Critical Error' : 'Error',
      description: userMessage,
      variant: severity === 'low' ? 'default' : 'destructive',
      duration: severity === 'critical' ? 7000 : 5000,
    });
  }
};

/**
 * Try to execute a function with standardized error handling
 * Returns null if operation fails
 */
export const trySafe = async <T>(
  operation: () => Promise<T>,
  source: string,
  options: ErrorOptions = {}
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    handleError(error, source, options);
    return null;
  }
};

/**
 * Try to execute a function with standardized error handling
 * Returns a fallback value if operation fails
 */
export const trySafeWithFallback = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  source: string,
  options: ErrorOptions = {}
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    handleError(error, source, options);
    return fallback;
  }
};
