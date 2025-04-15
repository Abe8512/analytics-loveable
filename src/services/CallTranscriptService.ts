import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { CallTranscript } from "@/types/call";
import { useEventListener } from "@/services/events/hooks";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
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
    
    try {
      console.log('Fetching transcripts with force refresh:', options?.force || false);
      
      // Force clear cache if explicitly requested
      if (options?.force) {
        setLastFetch(null);
        setLastFetchOptions(null);
      }

      const limit = options?.limit || DEFAULT_PAGE_SIZE;
      const page = Math.max(currentPage, 1);
      const offset = options?.offset !== undefined ? options?.offset : (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('call_transcripts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      const formattedData = data.map(item => validateTranscript(item));
      
      setTranscripts(formattedData);
      
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / limit));
      }
      
      setLastFetch(new Date());
      setLoading(false);
      
      return formattedData;
    } catch (err) {
      console.error('Error fetching transcripts:', err);
      setError(err as Error);
      setLoading(false);
      return [];
    }
  }, [currentPage]);

  // Implement nextPage function
  const nextPage = async (): Promise<void> => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      await fetchTranscripts();
    }
  };

  // Implement previousPage function
  const previousPage = async (): Promise<void> => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      await fetchTranscripts();
    }
  };

  // Add refreshData function with proper return type
  const refreshData = async (): Promise<void> => {
    await fetchTranscripts({ force: true });
  };

  // Add more robust event listeners
  useEventListener('call-uploaded' as EventType, () => {
    console.log('Call uploaded event received, refreshing transcripts');
    refreshData();
  });

  useEventListener('bulk-upload-completed' as EventType, () => {
    console.log('Bulk upload completed event received, refreshing transcripts');
    refreshData();
  });

  // Initial and dependency-based fetch
  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);

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

/**
 * Creates a new call transcript
 * @param transcriptData 
 * @returns 
 */
export const createCallTranscript = async (transcriptData: Partial<CallTranscript>) => {
  try {
    // Ensure we have the required fields
    if (!transcriptData.text) {
      console.error('Missing required fields for transcript creation');
      return { error: 'Missing required fields', data: null };
    }
    
    // Insert the transcript into the database
    const { data, error } = await supabase
      .from('call_transcripts')
      .insert({
        text: transcriptData.text,
        filename: transcriptData.filename,
        duration: transcriptData.duration || 0,
        sentiment: transcriptData.sentiment || 'neutral',
        keywords: transcriptData.keywords || [],
        key_phrases: transcriptData.key_phrases || [],
        call_score: transcriptData.call_score || 50,
        user_name: transcriptData.user_name,
        customer_name: transcriptData.customer_name,
        assigned_to: transcriptData.assigned_to,
        metadata: transcriptData.metadata || {}
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { error: null, data };
  } catch (err) {
    console.error('Error creating call transcript:', err);
    return { error: err as Error, data: null };
  }
};
