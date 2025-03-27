
import { useMemo, useCallback, useRef, useEffect, DependencyList } from 'react';

/**
 * Enhanced version of useMemo with deep comparison of dependencies
 */
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
  const depsRef = useRef<DependencyList>(deps);
  const valueRef = useRef<T>(factory());
  
  // Only recompute if deps have changed with deep comparison
  if (haveDepsDeeplyChanged(depsRef.current, deps)) {
    depsRef.current = deps;
    valueRef.current = factory();
  }
  
  return valueRef.current;
}

/**
 * Enhanced version of useCallback with deep comparison of dependencies
 */
export function useDeepCallback<T extends Function>(callback: T, deps: DependencyList): T {
  // Use useDeepMemo to get a memoized version of the callback
  return useDeepMemo(() => callback, deps) as T;
}

/**
 * Hook for memoizing expensive calculations with better debugging
 */
export function useTrackedMemo<T>(
  factory: () => T, 
  deps: DependencyList, 
  debugLabel?: string
): T {
  const startTime = performance.now();
  const result = useMemo(factory, deps);
  const endTime = performance.now();
  
  // Log performance info in development
  useEffect(() => {
    const duration = endTime - startTime;
    if (duration > 5 && process.env.NODE_ENV === 'development') {
      console.warn(
        `Slow memo computation${debugLabel ? ` (${debugLabel})` : ''}: ${duration.toFixed(2)}ms`
      );
    }
  }, [endTime, startTime, debugLabel]);
  
  return result;
}

/**
 * Helper function to check if dependencies have deeply changed
 */
function haveDepsDeeplyChanged(oldDeps: DependencyList, newDeps: DependencyList): boolean {
  if (oldDeps.length !== newDeps.length) return true;
  
  return oldDeps.some((oldDep, index) => {
    const newDep = newDeps[index];
    
    // Simple equality check for primitives
    if (oldDep === newDep) return false;
    
    // Deep comparison for objects and arrays
    if (
      typeof oldDep === 'object' && 
      oldDep !== null && 
      typeof newDep === 'object' && 
      newDep !== null
    ) {
      // Compare keys
      const oldKeys = Object.keys(oldDep);
      const newKeys = Object.keys(newDep);
      
      if (oldKeys.length !== newKeys.length) return true;
      
      // Check if values are different
      for (const key of oldKeys) {
        if (oldDep[key] !== newDep[key]) return true;
      }
      
      return false;
    }
    
    // Default to considering them different
    return true;
  });
}
