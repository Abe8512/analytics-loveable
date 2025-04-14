
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import {
  CallTranscript,
  CallTranscriptSegment,
  CallSentiment,
  SentimentType
} from '@/types/call';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventsService } from '@/services/EventsService';
import { EventType } from '@/services/events/types';

interface TranscriptContextProps {
  transcript: CallTranscript | null;
  segments: CallTranscriptSegment[] | null;
  sentiment: CallSentiment | null;
  isLoading: boolean;
  error: string | null;
  loadTranscript: (id: string) => Promise<void>;
  refreshTranscripts: () => Promise<void>;
  transcripts?: CallTranscript[];
}

const TranscriptContext = createContext<TranscriptContextProps | undefined>(
  undefined
);

export const TranscriptProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transcript, setTranscript] = useState<CallTranscript | null>(null);
  const [segments, setSegments] = useState<CallTranscriptSegment[] | null>(null);
  const [sentiment, setSentiment] = useState<CallSentiment | null>(null);
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadTranscript = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Ensure sentiment is one of the allowed types
        const sentimentValue = data.sentiment as SentimentType;
        setTranscript({
          ...data,
          sentiment: sentimentValue,
        });
        setSegments(data.transcript_segments as CallTranscriptSegment[] || []);
        setSentiment(data.sentiment_data as CallSentiment || { agent: 0.5, customer: 0.5, overall: 0.5 });
      } else {
        setTranscript(null);
        setSegments(null);
        setSentiment(null);
        setError('Transcript not found');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error loading transcript',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refreshTranscripts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Fetch all transcripts for the current user
      const { data: callTranscripts, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      if (callTranscripts) {
        // Update the local state with the refreshed transcripts
        console.log('Transcripts refreshed:', callTranscripts.length);
        setTranscripts(callTranscripts as CallTranscript[]);
        
        // Also dispatch an event for other components to know transcripts were refreshed
        const unsubscribe = EventsService.addEventListener('transcripts-refreshed' as EventType, {
          transcripts: callTranscripts,
        });
        
        // Clean up the event listener
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      } else {
        console.log('No transcripts found for the current user.');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error refreshing transcripts',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    // Fix the event listener issue
    const unsubscribe1 = EventsService.addEventListener('transcript-selected' as EventType, (payload) => {
      if (payload && payload.transcriptId) {
        loadTranscript(payload.transcriptId);
      }
    });
    const unsubscribe2 = EventsService.addEventListener('transcript-updated' as EventType, () => refreshTranscripts());
    const unsubscribe3 = EventsService.addEventListener('transcripts-updated' as EventType, () => refreshTranscripts());
    const unsubscribe4 = EventsService.addEventListener('bulk-upload-completed' as EventType, () => refreshTranscripts());

    // Make sure to properly cleanup in useEffect return function
    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  }, [loadTranscript, refreshTranscripts]);

  const value: TranscriptContextProps = {
    transcript,
    segments,
    sentiment,
    isLoading,
    error,
    loadTranscript,
    refreshTranscripts,
    transcripts,
  };

  return (
    <TranscriptContext.Provider value={value}>
      {children}
    </TranscriptContext.Provider>
  );
};

export const useTranscript = () => {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error('useTranscript must be used within a TranscriptProvider');
  }
  return context;
};

// Add a new hook that has the same functionality but with a different name
export const useTranscripts = useTranscript;
