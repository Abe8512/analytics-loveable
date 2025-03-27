
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
}

export interface UseCallTranscriptsResult {
  transcripts: CallTranscript[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  fetchTranscripts: (options?: CallTranscriptFilter) => Promise<CallTranscript[]>;
}

export const useCallTranscripts = (): UseCallTranscriptsResult => {
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const { filters } = useSharedFilters();
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const CACHE_TTL = 60000; // 1 minute cache TTL
  
  const fetchTranscripts = useCallback(async (options?: CallTranscriptFilter): Promise<CallTranscript[]> => {
    setLoading(true);
    
    // Check if we can use cached data and force isn't set
    const now = new Date();
    if (
      !options?.force && 
      transcripts.length > 0 && 
      lastFetch && 
      now.getTime() - lastFetch.getTime() < CACHE_TTL
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
      
      // Order by created_at
      query = query.order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching transcripts from database:', error);
        errorHandler.handleError(error, 'CallTranscriptService.fetchTranscripts.databaseError');
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} transcripts from database`);
        const formattedData = data.map(item => ({
          ...item,
          keywords: item.keywords || [],
          sentiment: item.sentiment || 'neutral',
          call_score: item.call_score || 50,
          duration: item.duration || 0
        })) as CallTranscript[];
        
        setTranscripts(formattedData);
        setTotalCount(count || formattedData.length);
        setLastFetch(now);
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
        setLastFetch(now);
        setLoading(false);
        return [];
      }
      
      // Convert localStorage format to CallTranscript format
      const formattedTranscripts = localTranscripts.map(t => ({
        id: t.id,
        text: t.text,
        created_at: t.date,
        duration: t.duration || 0,
        sentiment: t.sentiment as "positive" | "neutral" | "negative" || "neutral",
        call_score: t.call_score || 50,
        keywords: t.keywords || [],
        filename: t.filename || "Unknown",
        transcript_segments: t.transcript_segments || [],
        user_id: t.speakerName || 'anonymous'
      })) as CallTranscript[];
      
      console.log(`Using ${formattedTranscripts.length} transcripts from local storage`);
      setTranscripts(formattedTranscripts);
      setTotalCount(formattedTranscripts.length);
      setLastFetch(now);
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
  }, [transcripts, lastFetch]);
  
  // Initial data loading
  useEffect(() => {
    fetchTranscripts({
      dateRange: filters.dateRange
    });
  }, [filters.dateRange, fetchTranscripts]);
  
  // Listen for transcript events
  useEventListener('transcript-created' as EventType, () => {
    console.log('Received transcript-created event, refreshing data');
    fetchTranscripts({
      dateRange: filters.dateRange,
      force: true
    });
  });
  
  useEventListener('transcripts-updated' as EventType, () => {
    console.log('Received transcriptions-updated event, refreshing data');
    fetchTranscripts({
      dateRange: filters.dateRange,
      force: true
    });
  });
  
  useEventListener('bulk-upload-completed' as EventType, () => {
    console.log('Received bulk-upload-completed event, refreshing data');
    fetchTranscripts({
      dateRange: filters.dateRange,
      force: true
    });
  });
  
  return {
    transcripts,
    loading,
    error,
    totalCount,
    fetchTranscripts
  };
};
