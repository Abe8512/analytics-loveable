
import { useState, useEffect, useCallback } from 'react';
import { CallTranscript } from '@/types/call';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface FetchTranscriptsOptions {
  force?: boolean;
  assignedTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UseCallTranscriptsResult {
  transcripts: CallTranscript[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  fetchTranscripts: (options?: FetchTranscriptsOptions) => Promise<CallTranscript[]>;
}

export const useCallTranscripts = (): UseCallTranscriptsResult => {
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchTranscripts = useCallback(async (options: FetchTranscriptsOptions = {}) => {
    try {
      setLoading(true);
      
      const { 
        force = false,
        assignedTo,
        limit = 100,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      let query = supabase
        .from('call_transcripts')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching transcripts: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data as CallTranscript[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching transcripts';
      console.error(errorMessage);
      setError(err instanceof Error ? err : new Error('Unknown error fetching transcripts'));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchTranscripts({ force: true });
      setTranscripts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error refreshing transcripts';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [fetchTranscripts, toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { transcripts, loading, error, refresh, fetchTranscripts };
};
