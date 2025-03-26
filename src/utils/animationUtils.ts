
/**
 * Animation utility functions for smoother UI transitions and performance
 */

export const animationUtils = {
  // Throttle a function to prevent excessive calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
    let inThrottle: boolean = false;
    let lastResult: ReturnType<T>;
    
    return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
      if (!inThrottle) {
        inThrottle = true;
        lastResult = func.apply(this, args);
        
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
      
      return lastResult;
    };
  },
  
  // Debounce a function to wait until after calls stop
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return function(this: any, ...args: Parameters<T>): void {
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  },
  
  // Add smooth entrance animation for items
  staggeredEntrance: (delay: number, baseDelay: number = 50) => {
    return {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.3, 
          delay: baseDelay * delay / 1000 
        }
      }
    };
  }
};
