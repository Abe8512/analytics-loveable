
import { useState, useEffect, useCallback } from 'react';
import { BulkUploadState } from '@/types/team';
import { EventsService } from '@/services/EventsService';
import { EventType } from '@/services/events/types';
import { BulkUploadStore } from '@/services/BulkUploadService';

export interface BulkUploadHooksResult {
  start: () => void;
  complete: () => void;
  setProgress: (progress: number) => void;
  addTranscript: (transcript: any) => void;
  setFileCount: (count: number) => void;
  uploadState: BulkUploadState;
  progress: number;
  transcripts: any[];
  fileCount: number;
}

/**
 * Custom hook to manage bulk upload state and events
 */
export const useBulkUpload = (): BulkUploadHooksResult => {
  const [uploadState, setUploadState] = useState<BulkUploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [fileCount, setFileCount] = useState(0);

  // Start the upload process
  const start = useCallback(() => {
    setUploadState('uploading');
    setProgress(0);
    
    // Dispatch event to notify other components
    EventsService.addEventListener('bulk-upload-started' as EventType, { timestamp: Date.now() });
  }, []);

  // Mark the upload as complete
  const complete = useCallback(() => {
    setUploadState('complete');
    setProgress(100);
    
    // Dispatch event to notify other components
    EventsService.addEventListener('bulk-upload-completed' as EventType, {
      timestamp: Date.now(),
      transcriptsCount: transcripts.length
    });
    
    // Create a custom event for compatibility with old code
    const customEvent = new CustomEvent('bulk-upload-completed');
    window.dispatchEvent(customEvent);
  }, [transcripts.length]);

  // Add a new transcript to the list
  const addTranscript = useCallback((transcript: any) => {
    setTranscripts(prev => [...prev, transcript]);
  }, []);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      // Clean up or save state if needed
    };
  }, []);

  return {
    // Methods
    start,
    complete,
    setProgress,
    addTranscript,
    setFileCount,
    
    // State
    uploadState,
    progress,
    transcripts,
    fileCount
  };
};
