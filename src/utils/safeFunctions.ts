
/**
 * Utility functions for safe operations and null checks
 */

/**
 * Safely get a value from an object with nested properties
 * @example safeGet(user, 'profile.address.city', 'Unknown City')
 */
export function safeGet<T, D = undefined>(
  obj: any, 
  path: string, 
  defaultValue: D = undefined as unknown as D
): T | D {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return (result === undefined || result === null) ? defaultValue : result as T;
}

/**
 * Safely call a function without throwing errors
 * @example safeCall(() => user.profile.getFullName(), 'Unknown User')
 */
export function safeCall<T, D = undefined>(
  fn: () => T, 
  defaultValue: D = undefined as unknown as D,
  errorHandler?: (error: Error) => void
): T | D {
  try {
    const result = fn();
    return (result === undefined || result === null) ? defaultValue : result;
  } catch (error) {
    if (errorHandler && error instanceof Error) {
      errorHandler(error);
    }
    return defaultValue;
  }
}

/**
 * Safely parse JSON without throwing
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}

/**
 * Safely stringify an object without throwing
 */
export function safeJsonStringify(obj: any, defaultValue: string = ''): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error stringifying object:', error);
    return defaultValue;
  }
}

/**
 * Safely access array elements with bounds checking
 */
export function safeArrayAccess<T>(
  array: T[] | null | undefined, 
  index: number, 
  defaultValue: T | undefined = undefined
): T | undefined {
  if (!array || !Array.isArray(array) || index < 0 || index >= array.length) {
    return defaultValue;
  }
  return array[index];
}
