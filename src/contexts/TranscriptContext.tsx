import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  CallTranscript, 
  SentimentType, 
  castToCallTranscript 
} from '@/types/call';
import { EventsService } from '@/services/EventsService';
import { EventType } from '@/services/events/types';

interface TranscriptContextType {
  currentTranscript: CallTranscript | null;
  transcripts: CallTranscript[];
  isLoading: boolean;
  error: string | null;
  setCurrentTranscript: (transcript: CallTranscript | null) => void;
  fetchTranscripts: () => Promise<void>;
  updateTranscriptSentiment: (id: string, sentiment: SentimentType) => Promise<void>;
  fetchTranscriptById: (id: string) => Promise<CallTranscript | null>;
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(undefined);

export const TranscriptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTranscript, setCurrentTranscript] = useState<CallTranscript | null>(null);
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranscripts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Safely cast the data to CallTranscript[] using our helper
      const safeTranscripts = data?.map(transcript => castToCallTranscript(transcript)) || [];
      setTranscripts(safeTranscripts);
      
      // Dispatch event to notify other components
      EventsService.dispatchEvent('transcript-updated' as EventType, { 
        transcripts: safeTranscripts,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      setError('Failed to fetch transcripts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTranscriptById = useCallback(async (id: string): Promise<CallTranscript | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Use our helper to safely cast the data
      return data ? castToCallTranscript(data) : null;
    } catch (error) {
      console.error('Error fetching transcript by ID:', error);
      setError('Failed to fetch transcript');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTranscriptSentiment = useCallback(async (id: string, sentiment: SentimentType) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('call_transcripts')
        .update({ sentiment })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTranscripts(prev => 
        prev.map(transcript => 
          transcript.id === id ? { ...transcript, sentiment } : transcript
        )
      );

      // If the current transcript is the one being updated, update it too
      if (currentTranscript && currentTranscript.id === id) {
        setCurrentTranscript({ ...currentTranscript, sentiment });
      }

      // Dispatch event
      EventsService.dispatchEvent('sentiment-updated' as EventType, { 
        id, 
        sentiment,
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error updating transcript sentiment:', error);
      setError('Failed to update sentiment');
    } finally {
      setIsLoading(false);
    }
  }, [currentTranscript]);

  // Initial fetch
  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);

  const contextValue: TranscriptContextType = {
    currentTranscript,
    transcripts,
    isLoading,
    error,
    setCurrentTranscript,
    fetchTranscripts,
    updateTranscriptSentiment,
    fetchTranscriptById
  };

  return (
    <TranscriptContext.Provider value={contextValue}>
      {children}
    </TranscriptContext.Provider>
  );
};

export const useTranscripts = () => {
  const context = useContext(TranscriptContext);
  if (context === undefined) {
    throw new Error('useTranscripts must be used within a TranscriptProvider');
  }
  return context;
};
