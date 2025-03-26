
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { CallTranscript } from "@/types/call";
import { useEventListener } from "@/services/EventsService";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { StoredTranscription, getStoredTranscriptions } from "@/services/WhisperService";

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
      // We'll first try to get data from Supabase
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
        setTranscripts(data as CallTranscript[]);
        setTotalCount(count || data.length);
        setLoading(false);
        return data as CallTranscript[];
      }
      
      // If no data in database or error, fall back to local storage
      console.log('Falling back to local storage for transcripts');
      const localTranscripts = getStoredTranscriptions();
      
      if (localTranscripts.length === 0) {
        // Generate sample data if nothing is available
        const sampleTranscripts = generateSampleTranscripts();
        setTranscripts(sampleTranscripts as unknown as CallTranscript[]);
        setTotalCount(sampleTranscripts.length);
        setLoading(false);
        return sampleTranscripts as unknown as CallTranscript[];
      }
      
      setTranscripts(localTranscripts as unknown as CallTranscript[]);
      setTotalCount(localTranscripts.length);
      setLoading(false);
      return localTranscripts as unknown as CallTranscript[];
      
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
  useEventListener('transcript-created', () => {
    fetchTranscripts({
      dateRange: filters.dateRange
    });
  });
  
  useEventListener('transcriptions-updated', () => {
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

function generateSampleTranscripts(): StoredTranscription[] {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);
  
  return [
    {
      id: '1',
      text: "Hi, this is John from sales. I'm calling to follow up on our previous conversation about our software solution. Could you tell me more about your current needs?",
      date: now.toISOString(),
      sentiment: 'positive',
      duration: 124,
      call_score: 85,
      keywords: ['software', 'needs', 'solution']
    },
    {
      id: '2',
      text: "Hello, I'm calling about the issue you reported yesterday. I understand it's been frustrating. Let me see how I can help resolve this problem quickly for you.",
      date: yesterday.toISOString(),
      sentiment: 'neutral',
      duration: 183,
      call_score: 72,
      keywords: ['issue', 'problem', 'help']
    },
    {
      id: '3',
      text: "I'm disappointed with the service quality. We've had repeated issues with the product and the support has been inadequate. I'd like to speak with a manager.",
      date: twoDaysAgo.toISOString(),
      sentiment: 'negative',
      duration: 215,
      call_score: 45,
      keywords: ['disappointed', 'issues', 'inadequate']
    }
  ];
}
