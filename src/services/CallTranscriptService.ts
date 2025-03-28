import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback, useRef } from "react";
import { CallTranscript } from "@/types/call";
import { useEventListener } from "@/services/events/hooks";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { StoredTranscription, getStoredTranscriptions } from "@/services/WhisperService";
import { EventType } from "@/services/events/types";
import { errorHandler } from "@/services/ErrorHandlingService";
import { toast } from "sonner";
import { useConnectionStatus } from "./ConnectionMonitorService";

export interface CallTranscriptFilter {
  dateRange?: { from: Date; to: Date };
  repId?: string;
  sentiment?: string;
  force?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface UseCallTranscriptsResult {
  transcripts: CallTranscript[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  fetchTranscripts: (options?: CallTranscriptFilter) => Promise<CallTranscript[]>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  currentPage: number;
  totalPages: number;
  refreshData: () => Promise<void>;
}

// Default page size for pagination
const DEFAULT_PAGE_SIZE = 10;

// Cache TTL - 5 minutes is appropriate for standard usage
const CACHE_TTL = 5 * 60 * 1000; 

// Configuration for retry mechanism
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_COOLDOWN = 2000; // 2 seconds cooldown between identical requests

export const useCallTranscripts = (): UseCallTranscriptsResult => {
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { filters } = useSharedFilters();
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [lastFetchOptions, setLastFetchOptions] = useState<string | null>(null);
  const pendingRequestRef = useRef<boolean>(false);
  const lastRequestTimeRef = useRef<number>(0);
  const { isConnected } = useConnectionStatus();
  
  // Helper to validate CallTranscript data
  const validateTranscript = (data: any): CallTranscript => {
    // Ensure all required fields have valid values
    return {
      id: data.id || '',
      text: data.text || '',
      created_at: data.created_at || new Date().toISOString(),
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      sentiment: ['positive', 'neutral', 'negative'].includes(data.sentiment) 
        ? data.sentiment as "positive" | "neutral" | "negative" 
        : "neutral",
      call_score: typeof data.call_score === 'number' ? data.call_score : 50,
      duration: typeof data.duration === 'number' ? data.duration : 0,
      transcript_segments: Array.isArray(data.transcript_segments) ? data.transcript_segments : [],
      filename: data.filename || "Unknown",
      user_id: data.user_id || 'anonymous'
    };
  };

  // Helper function to execute with retries
  const executeWithRetry = async<T>(
    operation: () => Promise<T>,
    retries: number = MAX_RETRIES
  ): Promise<T> => {
    try {
      return await operation();
    } catch (err) {
      if (retries <= 0) {
        throw err;
      }
      
      console.log(`Retrying operation, ${retries} attempts left`);
      // Exponential backoff
      const delay = RETRY_DELAY_MS * (MAX_RETRIES - retries + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return executeWithRetry(operation, retries - 1);
    }
  };
  
  const fetchTranscripts = useCallback(async (options?: CallTranscriptFilter): Promise<CallTranscript[]> => {
    // Check if we're already processing a request
    if (pendingRequestRef.current) {
      console.log('Request already in progress, skipping duplicate request');
      return transcripts;
    }
    
    // Check connection status
    if (!isConnected && !options?.force) {
      console.log('Offline - using cached data');
      // If we're offline and not forcing a refresh, use cached data
      if (transcripts.length > 0) {
        return transcripts;
      }
      // Otherwise try to get data from local storage
      const localTranscripts = getStoredTranscriptions();
      if (localTranscripts.length > 0) {
        const formattedTranscripts = localTranscripts.map(t => validateTranscript({
          id: t.id,
          text: t.text,
          created_at: t.date,
          duration: t.duration || 0,
          sentiment: t.sentiment,
          call_score: t.call_score || 50,
          keywords: t.keywords || [],
          filename: t.filename || "Unknown",
          transcript_segments: t.transcript_segments || [],
          user_id: t.speakerName || 'anonymous'
        }));
        setTranscripts(formattedTranscripts);
        return formattedTranscripts;
      }
      return [];
    }
    
    // Check for request throttling
    const now = Date.now();
    if (now - lastRequestTimeRef.current < REQUEST_COOLDOWN && !options?.force) {
      console.log(`Request throttled, last request was ${now - lastRequestTimeRef.current}ms ago`);
      return transcripts;
    }
    
    pendingRequestRef.current = true;
    lastRequestTimeRef.current = now;
    setLoading(true);
    
    // Set default values for pagination
    const limit = options?.limit || DEFAULT_PAGE_SIZE;
    const page = Math.max(currentPage, 1);
    const offset = options?.offset !== undefined ? options?.offset : (page - 1) * limit;
    
    // Create a cache key based on all filter options
    const cacheKey = JSON.stringify({
      dateRange: options?.dateRange,
      repId: options?.repId,
      sentiment: options?.sentiment,
      limit,
      offset,
      orderBy: options?.orderBy || 'created_at',
      orderDirection: options?.orderDirection || 'desc'
    });
    
    // Check if we can use cached data and force isn't set
    if (
      !options?.force && 
      transcripts.length > 0 && 
      lastFetch && 
      now - lastFetch.getTime() < CACHE_TTL &&
      lastFetchOptions === cacheKey
    ) {
      console.log('Using cached transcript data');
      setLoading(false);
      pendingRequestRef.current = false;
      return transcripts;
    }
    
    try {
      console.log('Fetching transcript data with options:', options);
      
      // Try to get data from Supabase with retries
      let data, error, count;
      
      try {
        // Try to get data from Supabase
        const result = await executeWithRetry(async () => {
          let query = supabase
            .from('call_transcripts')
            .select('*', { count: 'exact' });
          
          // Apply date range filter if provided
          if (options?.dateRange) {
            const fromDate = options.dateRange.from.toISOString();
            const toDate = options.dateRange.to.toISOString();
            query = query.gte('created_at', fromDate).lte('created_at', toDate);
          }
          
          // Apply rep filter if provided
          if (options?.repId) {
            query = query.eq('user_id', options.repId);
          }
          
          // Apply sentiment filter if provided
          if (options?.sentiment) {
            query = query.eq('sentiment', options.sentiment);
          }
          
          // Apply ordering
          const orderBy = options?.orderBy || 'created_at';
          const orderDirection = options?.orderDirection || 'desc';
          query = query.order(orderBy, { ascending: orderDirection === 'asc' });
          
          // Apply pagination
          query = query.range(offset, offset + limit - 1);
          
          return await query;
        });
        
        data = result.data;
        error = result.error;
        count = result.count;
      } catch (fetchError) {
        console.error('Failed to fetch from Supabase after retries:', fetchError);
        toast.error("Connection issue", {
          description: "Couldn't connect to the database. Using local data instead.",
          duration: 3000
        });
        data = null;
        error = { message: "Connection failed after retries" };
      }
      
      if (error) {
        console.error('Error fetching transcripts from database:', error);
        errorHandler.handleError(error, 'CallTranscriptService.fetchTranscripts.databaseError');
        
        // Use local data as fallback
        const localTranscripts = getStoredTranscriptions();
        if (localTranscripts.length > 0) {
          const formattedTranscripts = localTranscripts.map(t => validateTranscript({
            id: t.id,
            text: t.text,
            created_at: t.date,
            duration: t.duration || 0,
            sentiment: t.sentiment,
            call_score: t.call_score || 50,
            keywords: t.keywords || [],
            filename: t.filename || "Unknown",
            transcript_segments: t.transcript_segments || [],
            user_id: t.speakerName || 'anonymous'
          }));
          setTranscripts(formattedTranscripts);
          setLoading(false);
          pendingRequestRef.current = false;
          return formattedTranscripts;
        }
        
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} transcripts from database`);
        
        // Validate and normalize data
        const formattedData = data.map(item => validateTranscript(item));
        
        // Update pagination info
        const total = count || 0;
        const pages = Math.ceil(total / limit);
        
        setTranscripts(formattedData);
        setTotalCount(total);
        setTotalPages(pages);
        setLastFetch(new Date());
        setLastFetchOptions(cacheKey);
        setLoading(false);
        pendingRequestRef.current = false;
        return formattedData;
      }
      
      // If no data in database, fall back to local storage
      console.log('No data in database, falling back to local storage');
      const localTranscripts = getStoredTranscriptions();
      
      if (localTranscripts.length === 0) {
        console.log('No transcripts available in local storage');
        setTranscripts([]);
        setTotalCount(0);
        setTotalPages(1);
        setLastFetch(new Date());
        setLastFetchOptions(cacheKey);
        setLoading(false);
        pendingRequestRef.current = false;
        return [];
      }
      
      // Apply filters to local storage data
      let filteredTranscripts = [...localTranscripts];
      
      // Apply date filter
      if (options?.dateRange) {
        const fromDate = options.dateRange.from.getTime();
        const toDate = options.dateRange.to.getTime();
        filteredTranscripts = filteredTranscripts.filter(t => {
          const date = new Date(t.date).getTime();
          return date >= fromDate && date <= toDate;
        });
      }
      
      // Apply sentiment filter
      if (options?.sentiment) {
        filteredTranscripts = filteredTranscripts.filter(t => 
          t.sentiment === options.sentiment
        );
      }
      
      // Apply sorting
      if (options?.orderBy) {
        const key = options.orderBy as keyof StoredTranscription;
        const direction = options?.orderDirection === 'asc' ? 1 : -1;
        
        filteredTranscripts.sort((a, b) => {
          if (a[key] < b[key]) return -1 * direction;
          if (a[key] > b[key]) return 1 * direction;
          return 0;
        });
      } else {
        // Default sort by date (newest first)
        filteredTranscripts.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
      
      // Apply pagination to local storage data
      const paginatedTranscripts = filteredTranscripts.slice(offset, offset + limit);
      
      // Convert localStorage format to CallTranscript format
      const formattedTranscripts = paginatedTranscripts.map(t => validateTranscript({
        id: t.id,
        text: t.text,
        created_at: t.date,
        duration: t.duration || 0,
        sentiment: t.sentiment,
        call_score: t.call_score || 50,
        keywords: t.keywords || [],
        filename: t.filename || "Unknown",
        transcript_segments: t.transcript_segments || [],
        user_id: t.speakerName || 'anonymous'
      }));
      
      // Update pagination info for local storage
      const totalLocal = filteredTranscripts.length;
      const pagesLocal = Math.ceil(totalLocal / limit);
      
      console.log(`Using ${formattedTranscripts.length} transcripts from local storage (filtered from ${filteredTranscripts.length})`);
      setTranscripts(formattedTranscripts);
      setTotalCount(totalLocal);
      setTotalPages(pagesLocal);
      setLastFetch(new Date());
      setLastFetchOptions(cacheKey);
      setLoading(false);
      pendingRequestRef.current = false;
      return formattedTranscripts;
    } catch (err) {
      console.error('Error in fetchTranscripts:', err);
      errorHandler.handleError(err, 'CallTranscriptService.fetchTranscripts');
      setError(err as Error);
      setLoading(false);
      pendingRequestRef.current = false;
      
      // Return current transcripts as fallback
      return transcripts.length > 0 ? transcripts : [];
    }
  }, [transcripts, lastFetch, lastFetchOptions, currentPage, isConnected]);
  
  // Pagination helpers
  const nextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      const nextPageNum = currentPage + 1;
      setCurrentPage(nextPageNum);
      await fetchTranscripts({
        ...filters,
        offset: (nextPageNum - 1) * DEFAULT_PAGE_SIZE,
        limit: DEFAULT_PAGE_SIZE
      });
    }
  }, [currentPage, totalPages, filters, fetchTranscripts]);
  
  const previousPage = useCallback(async () => {
    if (currentPage > 1) {
      const prevPageNum = currentPage - 1;
      setCurrentPage(prevPageNum);
      await fetchTranscripts({
        ...filters,
        offset: (prevPageNum - 1) * DEFAULT_PAGE_SIZE,
        limit: DEFAULT_PAGE_SIZE
      });
    }
  }, [currentPage, filters, fetchTranscripts]);
  
  // Helper to force refresh data
  const refreshData = useCallback(async () => {
    if (!isConnected) {
      toast.error("You're offline", {
        description: "Can't refresh data while offline",
        duration: 3000
      });
      return;
    }
    
    await fetchTranscripts({
      ...filters,
      offset: (currentPage - 1) * DEFAULT_PAGE_SIZE,
      limit: DEFAULT_PAGE_SIZE,
      force: true
    });
  }, [filters, currentPage, fetchTranscripts, isConnected]);
  
  // Initial data loading - only once when component mounts
  useEffect(() => {
    // Only attempt to fetch if connected
    if (isConnected) {
      const initialLoadDelay = setTimeout(() => {
        fetchTranscripts({
          dateRange: filters.dateRange,
          limit: DEFAULT_PAGE_SIZE,
          offset: 0
        });
      }, 500); // Small delay for UI to render first
      
      return () => clearTimeout(initialLoadDelay);
    } else {
      // If offline, try to get local data
      const localTranscripts = getStoredTranscriptions();
      if (localTranscripts.length > 0) {
        const formattedTranscripts = localTranscripts.map(t => validateTranscript({
          id: t.id,
          text: t.text,
          created_at: t.date,
          duration: t.duration || 0,
          sentiment: t.sentiment,
          call_score: t.call_score || 50,
          keywords: t.keywords || [],
          filename: t.filename || "Unknown",
          transcript_segments: t.transcript_segments || [],
          user_id: t.speakerName || 'anonymous'
        }));
        setTranscripts(formattedTranscripts);
        setLoading(false);
      }
    }
  }, []);
  
  // Listen for transcript events but debounce actual refresh
  const refreshTimeoutRef = useRef<number | null>(null);
  
  const handleTranscriptEvent = useCallback(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Debounce refresh to avoid multiple rapid refreshes
    refreshTimeoutRef.current = window.setTimeout(() => {
      console.log('Handling transcript event, refreshing data');
      refreshData();
      refreshTimeoutRef.current = null;
    }, 1000);
  }, [refreshData]);
  
  useEventListener('transcript-created' as EventType, handleTranscriptEvent);
  useEventListener('transcripts-updated' as EventType, handleTranscriptEvent);
  useEventListener('bulk-upload-completed' as EventType, handleTranscriptEvent);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    transcripts,
    loading,
    error,
    totalCount,
    fetchTranscripts,
    nextPage,
    previousPage,
    currentPage,
    totalPages,
    refreshData
  };
};
