
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { withErrorHandling } from './ErrorHandlingService';
import type { DataFilters } from './SharedDataService';
import { useEventsStore } from './EventsService';

export interface CallTranscript {
  id: string;
  text: string;
  created_at: string;
  user_id?: string;
  user_name?: string;
  customer_name?: string;
  duration?: number;
  call_score?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
  filename?: string;
  transcript_segments?: Array<{
    id: string;
    text: string;
    start: number;
    end: number;
    speaker: string;
  }>;
  metadata?: Record<string, any>;
}

interface UseCallTranscriptsResult {
  transcripts: CallTranscript[] | null;
  loading: boolean;
  error: Error | null;
  fetchTranscripts: (options?: { dateRange?: DataFilters['dateRange']; refresh?: boolean }) => Promise<void>;
  fetchTranscriptById: (id: string) => Promise<CallTranscript | null>;
}

export const useCallTranscripts = (): UseCallTranscriptsResult => {
  const [transcripts, setTranscripts] = useState<CallTranscript[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { dispatchEvent } = useEventsStore.getState();

  const fetchTranscripts = useCallback(
    withErrorHandling(
      async (options?: { dateRange?: DataFilters['dateRange']; refresh?: boolean }) => {
        try {
          setLoading(true);
          setError(null);
          
          console.log('Fetching transcripts with filters:', options);
          
          let query = supabase
            .from('call_transcripts')
            .select('*')
            .order('created_at', { ascending: false });
            
          // Apply date filter if provided
          if (options?.dateRange) {
            const { from, to } = options.dateRange;
            query = query.gte('created_at', from.toISOString())
                         .lte('created_at', to.toISOString());
          }
            
          // If user exists, filter by user_id
          if (user) {
            query = query.eq('user_id', user.id);
          }
          
          const { data, error } = await query.limit(10).range(0, 9);
          
          if (error) {
            throw new Error(`Error fetching transcripts: ${error.message}`);
          }
          
          setTranscripts(data);
          dispatchEvent('transcript-created');
          
          return data;
        } finally {
          setLoading(false);
        }
      },
      'Failed to fetch call transcripts'
    ),
    [user]
  );

  const fetchTranscriptById = useCallback(
    withErrorHandling(
      async (id: string) => {
        try {
          setLoading(true);
          setError(null);
          
          const { data, error } = await supabase
            .from('call_transcripts')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            throw new Error(`Error fetching transcript: ${error.message}`);
          }
          
          return data;
        } finally {
          setLoading(false);
        }
      },
      'Failed to fetch call transcript'
    ),
    []
  );

  return {
    transcripts,
    loading,
    error,
    fetchTranscripts,
    fetchTranscriptById
  };
};

// For simpler usage without the hook
export const fetchTranscriptsByDateRange = async (
  dateRange: { from: Date; to: Date }
): Promise<CallTranscript[]> => {
  const { data, error } = await supabase
    .from('call_transcripts')
    .select('*')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString())
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Error fetching transcripts: ${error.message}`);
  }
  
  return data || [];
};
