
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CallTranscript, castToCallTranscript } from '@/types/call';
import { useSearchParams } from 'react-router-dom';
import { EventsService } from '@/services/EventsService';
import { EventType } from '@/services/events/types';

interface UseTranscriptDetailsResult {
  transcript: CallTranscript | null;
  isLoading: boolean;
  error: Error | null;
  refreshTranscript: () => Promise<void>;
}

export const useTranscriptDetails = (): UseTranscriptDetailsResult => {
  const [transcript, setTranscript] = useState<CallTranscript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchParams] = useSearchParams();
  const transcriptId = searchParams.get('id');

  const fetchTranscript = useCallback(async () => {
    if (!transcriptId) {
      console.warn('No transcript ID provided in the URL.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('id', transcriptId)
        .single();

      if (error) {
        throw new Error(`Error fetching transcript: ${error.message}`);
      }

      if (data) {
        // Use our helper to safely cast the data
        setTranscript(castToCallTranscript(data));
      } else {
        setTranscript(null);
        console.warn('Transcript not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load transcript'));
    } finally {
      setIsLoading(false);
    }
  }, [transcriptId]);

  useEffect(() => {
    fetchTranscript();
  }, [fetchTranscript]);

  const handleTranscriptUpdated = useCallback((payload) => {
    if (payload.id === transcriptId) {
      fetchTranscript();
    }
  }, [transcriptId, fetchTranscript]);

  useEffect(() => {
    const unsubscribe = EventsService.addEventListener('transcript-updated' as EventType, handleTranscriptUpdated);
    
    return () => {
      unsubscribe();
    };
  }, [handleTranscriptUpdated]);

  const refreshTranscript = useCallback(async () => {
    await fetchTranscript();
  }, [fetchTranscript]);

  return { transcript, isLoading, error, refreshTranscript };
};
