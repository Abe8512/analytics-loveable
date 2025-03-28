
import { useState, useEffect } from 'react';
import { errorHandler } from '@/services/ErrorHandlingService';

/**
 * Custom hook to monitor and return network latency from the error handler
 * @returns Object containing the current network latency
 */
export const useNetworkLatency = () => {
  const [networkLatency, setNetworkLatency] = useState(0);
  
  useEffect(() => {
    // Update latency every second
    const interval = setInterval(() => {
      setNetworkLatency(errorHandler.networkLatency);
    }, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  return { networkLatency };
};
