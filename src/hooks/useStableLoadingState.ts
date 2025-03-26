
import { useState, useEffect } from 'react';

/**
 * A hook that provides a stabilized loading state with a delay
 * to prevent UI flickering on quick loading changes
 */
export const useStableLoadingState = (isLoading: boolean, delay: number = 300): boolean => {
  const [stableLoading, setStableLoading] = useState(isLoading);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      setStableLoading(true);
    } else {
      timer = setTimeout(() => setStableLoading(false), delay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, delay]);
  
  return stableLoading;
};
