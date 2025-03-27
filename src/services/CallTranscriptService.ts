
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { CallTranscript } from "@/types/call";
import { useEventListener } from "@/services/events/hooks";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { StoredTranscription, getStoredTranscriptions } from "@/services/WhisperService";
import { EventType } from "@/services/events/types";
import { errorHandler } from "@/services/ErrorHandlingService";

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

// Cache TTL - 5 minutes is more appropriate for real-world usage
const CACHE_TTL = 5 * 60 * 1000; 

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
  
  const fetchTranscripts = useCallback(async (options?: CallTranscriptFilter): Promise<CallTranscript[]> => {
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
    const now = new Date();
    if (
      !options?.force && 
      transcripts.length > 0 && 
      lastFetch && 
      now.getTime() - lastFetch.getTime() < CACHE_TTL &&
      lastFetchOptions === cacheKey
    ) {
      console.log('Using cached transcript data');
      setLoading(false);
      return transcripts;
    }
    
    try {
      console.log('Fetching transcript data with options:', options);
      
      // Try to get data from Supabase
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
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching transcripts from database:', error);
        errorHandler.handleError(error, 'CallTranscriptService.fetchTranscripts.databaseError');
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
        setLastFetch(now);
        setLastFetchOptions(cacheKey);
        setLoading(false);
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
        setLastFetch(now);
        setLastFetchOptions(cacheKey);
        setLoading(false);
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
      setLastFetch(now);
      setLastFetchOptions(cacheKey);
      setLoading(false);
      return formattedTranscripts;
    } catch (err) {
      console.error('Error in fetchTranscripts:', err);
      errorHandler.handleError(err, 'CallTranscriptService.fetchTranscripts');
      setError(err as Error);
      setLoading(false);
      
      // Return current transcripts as fallback
      return transcripts.length > 0 ? transcripts : [];
    }
  }, [transcripts, lastFetch, lastFetchOptions, currentPage]);
  
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
    await fetchTranscripts({
      ...filters,
      offset: (currentPage - 1) * DEFAULT_PAGE_SIZE,
      limit: DEFAULT_PAGE_SIZE,
      force: true
    });
  }, [filters, currentPage, fetchTranscripts]);
  
  // Initial data loading
  useEffect(() => {
    fetchTranscripts({
      dateRange: filters.dateRange,
      limit: DEFAULT_PAGE_SIZE,
      offset: 0
    });
  }, [filters.dateRange, fetchTranscripts]);
  
  // Listen for transcript events
  useEventListener('transcript-created' as EventType, () => {
    console.log('Received transcript-created event, refreshing data');
    refreshData();
  });
  
  useEventListener('transcripts-updated' as EventType, () => {
    console.log('Received transcriptions-updated event, refreshing data');
    refreshData();
  });
  
  useEventListener('bulk-upload-completed' as EventType, () => {
    console.log('Received bulk-upload-completed event, refreshing data');
    refreshData();
  });
  
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
