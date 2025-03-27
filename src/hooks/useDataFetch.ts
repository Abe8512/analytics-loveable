
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDataFetchOptions<T> {
  fetchFn: () => Promise<T>;
  initialData?: T;
  dependencyList?: any[];
  cacheKey?: string;
  cacheTTL?: number; // in milliseconds
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
  skip?: boolean;
}

interface UseDataFetchResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<T | undefined>;
  timestamp: number | null;
}

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};

export function useDataFetch<T>(options: UseDataFetchOptions<T>): UseDataFetchResult<T> {
  const {
    fetchFn,
    initialData,
    dependencyList = [],
    cacheKey,
    cacheTTL = 60000, // Default 1 minute
    onError,
    onSuccess,
    skip = false
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (): Promise<T | undefined> => {
    // Check cache first if cacheKey is provided
    if (cacheKey && cache[cacheKey]) {
      const cachedData = cache[cacheKey];
      const now = Date.now();

      if (now - cachedData.timestamp < cacheTTL) {
        console.log(`Using cached data for key: ${cacheKey}`);
        setData(cachedData.data);
        setTimestamp(cachedData.timestamp);
        return cachedData.data;
      } else {
        console.log(`Cache expired for key: ${cacheKey}, fetching fresh data`);
      }
    } else if (cacheKey) {
      console.log(`No cache found for key: ${cacheKey}, fetching fresh data`);
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching data with fetchFn...');
      const result = await fetchFn();
      console.log('Data fetched successfully:', result);
      
      if (isMounted.current) {
        setData(result);
        setTimestamp(Date.now());
        
        // Update cache if cacheKey provided
        if (cacheKey) {
          console.log(`Updating cache for key: ${cacheKey}`);
          cache[cacheKey] = {
            data: result,
            timestamp: Date.now()
          };
        }
        
        if (onSuccess) {
          console.log('Calling onSuccess callback');
          onSuccess(result);
        }
        return result;
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      
      if (isMounted.current) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        
        if (onError) {
          console.log('Calling onError callback');
          onError(error);
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, cacheKey, cacheTTL, onSuccess, onError]);

  useEffect(() => {
    isMounted.current = true;
    
    if (!skip) {
      fetchData();
    } else {
      console.log('Skipping initial data fetch');
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [skip, fetchData, ...dependencyList]);

  const refetch = useCallback(async () => {
    console.log('Manually refetching data...');
    // Clear cache for this key if it exists
    if (cacheKey) {
      console.log(`Clearing cache for key: ${cacheKey}`);
      delete cache[cacheKey];
    }
    return await fetchData();
  }, [fetchData, cacheKey]);

  return { data, isLoading, error, refetch, timestamp };
}

// Helper function to clear all cache
export function clearDataCache(): void {
  console.log('Clearing all data cache');
  Object.keys(cache).forEach(key => delete cache[key]);
}

// Helper function to clear specific cache entry
export function clearCacheEntry(key: string): void {
  console.log(`Clearing cache entry: ${key}`);
  delete cache[key];
}
