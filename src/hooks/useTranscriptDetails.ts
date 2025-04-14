
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CallTranscript } from '@/types/call';
import { useTranscripts } from '@/contexts/TranscriptContext';
import { onTranscriptSelected } from '@/services/events/transcriptEvents';

export const useTranscriptDetails = (transcriptId?: string) => {
  const { transcripts, getTranscriptById } = useTranscripts();
  const [transcript, setTranscript] = useState<CallTranscript | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Function to load transcript data
    const loadTranscript = async (id: string) => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get from context first
        const contextTranscript = await getTranscriptById(id);
        
        if (contextTranscript) {
          setTranscript(contextTranscript);
        } else {
          // Fall back to direct database fetch
          const { data, error } = await supabase
            .from('call_transcripts')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          setTranscript(data as CallTranscript);
        }
      } catch (err) {
        console.error('Error loading transcript:', err);
        setError(err instanceof Error ? err : new Error('Failed to load transcript'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (transcriptId) {
      loadTranscript(transcriptId);
    } else {
      setTranscript(null);
    }
  }, [transcriptId, getTranscriptById]);
  
  // Listen for transcript selection events
  useEffect(() => {
    const unsubscribe = onTranscriptSelected((selectedTranscript) => {
      if (selectedTranscript) {
        setTranscript(selectedTranscript);
      }
    });
    
    return unsubscribe;
  }, []);
  
  return { transcript, isLoading, error };
};
