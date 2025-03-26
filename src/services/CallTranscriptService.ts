
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { errorHandler } from './ErrorHandlingService';
import type { DataFilters } from '@/contexts/SharedFilterContext';
import { useEventsStore } from './events';

export interface CallTranscript {
  id: string;
  call_id: string;
  text: string;
  created_at: string;
  customer_name?: string;
  duration?: number;
  end_time?: string;
  sentiment: "positive" | "neutral" | "negative";
  speaker_count?: number;
  start_time?: string;
  assigned_to?: string;
  call_score?: number;
  keywords?: string[];
  filename?: string;
  user_name?: string;
  metadata?: any;
}

export interface CallTranscriptFilter {
  dateRange?: DataFilters['dateRange'];
  refresh?: boolean;
  force?: boolean;
}

interface UseCallTranscriptsResult {
  transcripts: CallTranscript[] | null;
  loading: boolean;
  error: Error | null;
  fetchTranscripts: (options?: CallTranscriptFilter) => Promise<void>;
  fetchTranscriptById: (id: string) => Promise<CallTranscript | null>;
}

// Helper for error handling
const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T, 
  errorMessage: string
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(errorMessage, error);
      errorHandler.handleError(error, errorMessage);
      throw error;
    }
  };
};

export const useCallTranscripts = (): UseCallTranscriptsResult => {
  const [transcripts, setTranscripts] = useState<CallTranscript[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { dispatchEvent } = useEventsStore.getState();

  const fetchTranscripts = useCallback(
    withErrorHandling(
      async (options?: CallTranscriptFilter) => {
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
          
          // Properly type and convert the data
          const typedTranscripts: CallTranscript[] = data?.map((item: any) => ({
            ...item,
            sentiment: validateSentiment(item.sentiment),
            keywords: item.keywords || []
          })) || [];
          
          setTranscripts(typedTranscripts);
          dispatchEvent('transcript-created');
          
          return typedTranscripts;
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
          
          // Properly convert the data
          const transcript: CallTranscript = {
            ...data,
            sentiment: validateSentiment(data.sentiment),
            keywords: data.keywords || []
          };
          
          return transcript;
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

// Function to validate sentiment values
function validateSentiment(sentiment: string): "positive" | "neutral" | "negative" {
  if (sentiment?.toLowerCase() === 'positive') return 'positive';
  if (sentiment?.toLowerCase() === 'negative') return 'negative';
  return 'neutral';
}

// For simpler usage without the hook
export const fetchTranscriptsByDateRange = async (
  dateRange: { from: Date; to: Date }
): Promise<CallTranscript[]> => {
  try {
    const { data, error } = await supabase
      .from('call_transcripts')
      .select('*')
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching transcripts: ${error.message}`);
    }
    
    // Ensure we return properly formatted data
    return (data || []).map(item => ({
      ...item,
      sentiment: validateSentiment(item.sentiment),
      keywords: item.keywords || []
    }));
  } catch (error) {
    errorHandler.handleError(error, 'fetchTranscriptsByDateRange');
    throw error;
  }
};
