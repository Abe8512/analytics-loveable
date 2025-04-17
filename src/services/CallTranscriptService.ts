
import { supabase } from '@/integrations/supabase/client';
import { CallTranscript, castToCallTranscript } from '@/types/call';
import { useState, useCallback, useEffect } from 'react';
import { getOpenAIKey } from './WhisperService';
import { dispatchSentimentUpdated } from './events/transcriptEvents';
import { dispatchEvent } from './events/store';
import { EventType, EVENT_TYPES } from './events/types';

interface UseCallTranscriptsResult {
  transcripts: CallTranscript[];
  loading: boolean;
  error: string | null;
  refreshData: (options?: { force?: boolean }) => Promise<void>;
}

interface SaveTranscriptOptions {
  transcriptText: string;
  filename?: string;
  assignedTo?: string;
  userId?: string;
  customerName?: string;
  userName?: string;
  duration?: number;
}

const CACHE_KEY = 'call_transcripts_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Convert any sentiment value to string format needed for database
const formatSentimentForStorage = (sentiment: any): string => {
  if (!sentiment) return 'neutral';
  
  if (typeof sentiment === 'string') {
    return sentiment;
  }
  
  if (typeof sentiment === 'object' && sentiment !== null) {
    // If it's a sentiment object, calculate average
    const avgSentiment = (sentiment.agent + sentiment.customer) / 2;
    return avgSentiment > 0.66 ? 'positive' : 
           avgSentiment > 0.33 ? 'neutral' : 'negative';
  }
  
  if (typeof sentiment === 'number') {
    return sentiment > 0.66 ? 'positive' : 
           sentiment > 0.33 ? 'neutral' : 'negative';
  }
  
  return 'neutral';
};

// Function to save a transcript to Supabase
export const saveTranscript = async (options: SaveTranscriptOptions): Promise<CallTranscript | null> => {
  try {
    const { transcriptText, filename, assignedTo, userId, customerName, userName, duration } = options;
    
    // Prepare the transcript data
    const transcriptData = {
      text: transcriptText,
      filename: filename || 'Unnamed recording',
      assigned_to: assignedTo,
      user_id: userId,
      customer_name: customerName || 'Customer',
      user_name: userName || 'Agent',
      duration: duration || 0,
      sentiment: 'neutral',  // Default sentiment
      call_score: 50,        // Default score
      metadata: {},
      keywords: []
    };
    
    // Insert the transcript
    const { data, error } = await supabase
      .from('call_transcripts')
      .insert(transcriptData)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error saving transcript:', error);
      return null;
    }
    
    // Convert and return the transcript
    const savedTranscript = castToCallTranscript(data);
    
    // Dispatch an event that a new transcript was created
    dispatchEvent(EVENT_TYPES.TRANSCRIPT_CREATED as EventType, { transcript: savedTranscript });
    
    return savedTranscript;
    
  } catch (error) {
    console.error('Error in saveTranscript:', error);
    return null;
  }
};

// Function to update sentiment of a transcript
export const updateTranscriptSentiment = async (transcriptId: string, sentiment: string | number): Promise<boolean> => {
  try {
    const sentimentValue = formatSentimentForStorage(sentiment);
    
    const { error } = await supabase
      .from('call_transcripts')
      .update({ sentiment: sentimentValue })
      .eq('id', transcriptId);
      
    if (error) {
      console.error('Error updating sentiment:', error);
      return false;
    }
    
    // Dispatch event for updated sentiment
    dispatchSentimentUpdated(transcriptId, sentiment);
    return true;
    
  } catch (error) {
    console.error('Error in updateTranscriptSentiment:', error);
    return false;
  }
};

// Custom hook for accessing call transcripts
export const useCallTranscripts = (): UseCallTranscriptsResult => {
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  
  const fetchTranscripts = useCallback(async (options?: { force?: boolean }) => {
    try {
      const now = Date.now();
      
      // Check if we should use cached data
      if (!options?.force && now - lastRefresh < CACHE_EXPIRY) {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (now - timestamp < CACHE_EXPIRY) {
            setTranscripts(data);
            setLoading(false);
            return;
          }
        }
      }
      
      setLoading(true);
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw new Error(`Error fetching transcripts: ${error.message}`);
      }
      
      // Process and set the data
      const processedData = Array.isArray(data) ? data.map(castToCallTranscript) : [];
      setTranscripts(processedData);
      
      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: processedData,
        timestamp: now
      }));
      
      setLastRefresh(now);
      
      // Dispatch an event that transcripts were refreshed
      dispatchEvent(EVENT_TYPES.TRANSCRIPTS_REFRESHED as EventType, { timestamp: new Date().toISOString() });
      
    } catch (err) {
      console.error('Error in fetchTranscripts:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [lastRefresh]);
  
  // Initial fetch
  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);
  
  // Refresh function exposed to components
  const refreshData = useCallback(async (options?: { force?: boolean }) => {
    await fetchTranscripts(options);
  }, [fetchTranscripts]);
  
  return { transcripts, loading, error, refreshData };
};
