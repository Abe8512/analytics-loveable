
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
  },

  // Easing function for smooth animation
  easeOutCubic: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },

  // Stabilize element height during animations
  getStableHeight: (element: HTMLElement | null): number => {
    if (!element) return 0;
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.height = 'auto';
    document.body.appendChild(clone);
    const height = clone.offsetHeight;
    document.body.removeChild(clone);
    return height;
  },

  // Stabilize dimensions for responsive components
  stabilizeDimension: (value: number, minValue: number = 100, maxValue: number = 2000): number => {
    return Math.max(minValue, Math.min(maxValue, value));
  }
};
