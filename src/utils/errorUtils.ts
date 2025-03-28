
/**
 * Formats an error into a consistent string representation
 * @param err The error to format
 * @returns Formatted error message
 */
export const formatError = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  
  if (typeof err === 'string') {
    return err;
  }
  
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Determines if an error is a server-side error
 * @param err The error to check
 * @returns Whether the error is server-side
 */
export const isServerError = (err: unknown): boolean => {
  if (err instanceof Error) {
    // Check if error represents a 500-level status code
    return /5\d\d/.test(err.message) || err.message.includes('server');
  }
  
  if (typeof err === 'string') {
    return /5\d\d/.test(err) || err.includes('server');
  }
  
  return false;
};

/**
 * Determines if an error is a network error
 * @param err The error to check
 * @returns Whether the error is network-related
 */
export const isNetworkError = (err: unknown): boolean => {
  if (err instanceof Error) {
    return (
      err.message.includes('network') ||
      err.message.includes('offline') ||
      err.message.includes('connection') ||
      err.message.includes('Internet')
    );
  }
  
  if (typeof err === 'string') {
    return (
      err.includes('network') ||
      err.includes('offline') ||
      err.includes('connection') ||
      err.includes('Internet')
    );
  }
  
  return false;
};
