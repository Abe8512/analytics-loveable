/**
 * Error Utilities
 * 
 * A collection of utility functions for handling errors consistently across the application.
 * 
 * @module utils/errorUtils
 */

/**
 * Gets a user-friendly error message from various error types
 * 
 * @param error - The error object or string
 * @returns A user-friendly error message string
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Formats an error for display, ensuring a consistent error message regardless of error type
 * This is an alias of getErrorMessage for backward compatibility
 * 
 * @param error - The error object or string
 * @returns A user-friendly error message string
 */
export const formatError = getErrorMessage;

/**
 * Logs an error with consistent formatting
 * 
 * @param error - The error object
 * @param context - Optional context information about where the error occurred
 */
export const logError = (error: unknown, context?: string): void => {
  const errorMessage = getErrorMessage(error);
  const contextMessage = context ? ` [${context}]` : '';
  
  console.error(`Error${contextMessage}:`, error);
  
  // Additional logging logic could be added here
  // e.g., sending errors to a monitoring service
};

/**
 * Safely executes an async function with error handling
 * 
 * @param fn - The async function to execute
 * @param errorHandler - Optional custom error handler
 * @returns The result of the async function or null if an error occurred
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<{ data: T | null; error: unknown }> => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      logError(error);
    }
    return { data: null, error };
  }
};

/**
 * Handle empty data states gracefully instead of using demo data
 * @param componentName Name of the component for logging
 * @returns Empty data object of the appropriate type
 */
export const handleEmptyData = (componentName: string) => {
  console.log(`No data available for ${componentName}`);
  return null;
};
