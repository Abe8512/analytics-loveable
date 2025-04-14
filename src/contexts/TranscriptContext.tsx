import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CallTranscript } from '@/types/call';
import { useCallTranscripts } from '@/services/CallTranscriptService';
import { EventsService } from '@/services/EventsService';
import { EventType } from '@/services/events/types';

interface TranscriptContextProps {
  transcripts: CallTranscript[];
  selectedTranscript: CallTranscript | null;
  isLoading: boolean;
  error: Error | null;
  setSelectedTranscript: (transcript: CallTranscript | null) => void;
  refreshTranscripts: (force?: boolean) => Promise<void>;
  getTranscriptById: (id: string) => Promise<CallTranscript | null>;
}

const TranscriptContext = createContext<TranscriptContextProps | undefined>(undefined);

export function TranscriptProvider({ children }: { children: React.ReactNode }) {
  const { 
    transcripts, 
    loading: isLoading, 
    error, 
    fetchTranscripts, 
    refreshData 
  } = useCallTranscripts();
  const [selectedTranscript, setSelectedTranscript] = useState<CallTranscript | null>(null);

  const refreshTranscripts = useCallback(async (force: boolean = false) => {
    try {
      await refreshData();
      // Dispatch event to notify other components of transcript updates
      EventsService.dispatchEvent('transcripts-refreshed' as EventType, { 
        timestamp: new Date().toISOString() 
      });
    } catch (err) {
      console.error('Error refreshing transcripts:', err);
    }
  }, [refreshData]);

  // Get a specific transcript by ID
  const getTranscriptById = useCallback(async (id: string): Promise<CallTranscript | null> => {
    if (!id) return null;
    
    // Check if transcript is already in the list
    const existing = transcripts.find(t => t.id === id);
    if (existing) return existing;
    
    try {
      // Fetch individual transcript if not in the list
      const { data, error } = await fetch(`/api/transcripts/${id}`).then(res => res.json());
      if (error) throw new Error(error.message);
      return data as CallTranscript;
    } catch (err) {
      console.error(`Error fetching transcript ${id}:`, err);
      return null;
    }
  }, [transcripts]);

  // Set up listeners for transcript events
  useEffect(() => {
    // Listen for transcript updates from other components
    const unsubscribeCreated = EventsService.addEventListener('transcript-created' as EventType, () => refreshTranscripts(true));
    const unsubscribeUpdated = EventsService.addEventListener('transcript-updated' as EventType, () => refreshTranscripts(true));
    const unsubscribeDeleted = EventsService.addEventListener('transcript-deleted' as EventType, () => refreshTranscripts(true));
    const unsubscribeUploaded = EventsService.addEventListener('bulk-upload-completed' as EventType, () => refreshTranscripts(true));
    
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeUploaded();
    };
  }, [refreshTranscripts]);

  const value = {
    transcripts,
    selectedTranscript,
    isLoading,
    error,
    setSelectedTranscript,
    refreshTranscripts,
    getTranscriptById
  };

  return (
    <TranscriptContext.Provider value={value}>
      {children}
    </TranscriptContext.Provider>
  );
}

export const useTranscripts = () => {
  const context = useContext(TranscriptContext);
  if (context === undefined) {
    throw new Error('useTranscripts must be used within a TranscriptProvider');
  }
  return context;
};
