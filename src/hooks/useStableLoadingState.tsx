
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Creates a stable loading state to prevent UI flickering and improve perceived performance
 * 
 * @param isLoading Current loading state
 * @param minLoadingTime Minimum time to show loading state in ms
 * @returns Stabilized loading state
 */
export const useStableLoadingState = (isLoading: boolean, minLoadingTime: number = 300): boolean => {
  const [stableLoading, setStableLoading] = useState(isLoading);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  
  // Clear timeout on unmount
  const clearLoadingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    // First-time loading, immediately show loading state
    if (isInitialLoadRef.current && isLoading) {
      setStableLoading(true);
      isInitialLoadRef.current = false;
      startTimeRef.current = Date.now();
      return;
    }
    
    // If moving to loading state
    if (isLoading && !stableLoading) {
      setStableLoading(true);
      startTimeRef.current = Date.now();
      clearLoadingTimeout();
    } 
    // If leaving loading state
    else if (!isLoading && stableLoading) {
      const elapsedTime = Date.now() - startTimeRef.current;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      // Ensure minimum loading time to prevent fast flickers
      // Loading state needs to be shown for at least minLoadingTime ms
      clearLoadingTimeout();
      
      // Use a slightly longer timeout for more stable UI
      timeoutRef.current = setTimeout(() => {
        setStableLoading(false);
      }, remainingTime + 50); // Add extra buffer time for smoother transitions
    }
    
    return clearLoadingTimeout;
  }, [isLoading, stableLoading, minLoadingTime, clearLoadingTimeout]);
  
  return stableLoading;
};

export default useStableLoadingState;
