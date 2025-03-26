
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { CallTranscript } from "@/types/call";
import { useEventListener } from "@/services/events/hooks";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { StoredTranscription, getStoredTranscriptions } from "@/services/WhisperService";
import { EventType } from "@/services/events/types";

export interface CallTranscriptFilter {
  dateRange?: { from: Date; to: Date };
  repId?: string;
  sentiment?: string;
  force?: boolean;
}

export interface UseCallTranscriptsResult {
  transcripts: CallTranscript[] | null;
  loading: boolean;
  error: Error | null;
  totalCount: number;
  fetchTranscripts: (options?: CallTranscriptFilter) => Promise<CallTranscript[]>;
}

export const useCallTranscripts = (): UseCallTranscriptsResult => {
  const [transcripts, setTranscripts] = useState<CallTranscript[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const { filters } = useSharedFilters();
  
  const fetchTranscripts = async (options?: CallTranscriptFilter): Promise<CallTranscript[]> => {
    setLoading(true);
    
    try {
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
      
      const { data, error, count } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transcripts from database:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} transcripts from database`);
        setTranscripts(data as CallTranscript[]);
        setTotalCount(count || data.length);
        setLoading(false);
        return data as CallTranscript[];
      }
      
      // If no data in database, fall back to local storage
      console.log('No data in database, falling back to local storage');
      const localTranscripts = getStoredTranscriptions();
      
      if (localTranscripts.length === 0) {
        console.log('No transcripts available in local storage');
        setTranscripts([]);
        setTotalCount(0);
        setLoading(false);
        return [];
      }
      
      // Convert localStorage format to CallTranscript format
      const formattedTranscripts = localTranscripts.map(t => ({
        id: t.id,
        text: t.text,
        created_at: t.date,
        duration: t.duration || 0,
        sentiment: t.sentiment as "positive" | "neutral" | "negative",
        call_score: t.call_score || 50,
        keywords: t.keywords || [],
        filename: t.filename || "Unknown",
        transcript_segments: t.transcript_segments 
      })) as CallTranscript[];
      
      setTranscripts(formattedTranscripts);
      setTotalCount(formattedTranscripts.length);
      setLoading(false);
      return formattedTranscripts;
    } catch (err) {
      console.error('Error in fetchTranscripts:', err);
      setError(err as Error);
      setLoading(false);
      return [];
    }
  };
  
  // Initial data loading
  useEffect(() => {
    fetchTranscripts({
      dateRange: filters.dateRange
    });
  }, [filters.dateRange]);
  
  // Listen for transcript events
  useEventListener('transcript-created' as EventType, () => {
    fetchTranscripts({
      dateRange: filters.dateRange
    });
  });
  
  useEventListener('transcripts-updated' as EventType, () => {
    fetchTranscripts({
      dateRange: filters.dateRange
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
