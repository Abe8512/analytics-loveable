
import { useState, useEffect } from 'react';
import { useBulkUploadStore, BulkUploadState } from '@/store/useBulkUploadStore';
import { BulkUploadFilter } from '@/types/bulkUpload';
import { EventsService } from '@/services/EventsService';
import { EventType } from '@/services/events/types';

// Create a hook for the bulk upload processing state
export const useBulkUploadProcessingState = () => {
  const {
    files,
    isProcessing,
    progress,
    start,
    complete,
    setProgress,
    addTranscript,
    setFileCount
  } = useBulkUploadStore();
  
  const [hasError, setHasError] = useState(false);
  
  // Listen for bulk upload events
  useEffect(() => {
    const handleBulkUploadProgress = (payload: any) => {
      const { file, progress: fileProgress, status, transcriptId, error } = payload;
      
      // Find the file in our state by name
      const fileToUpdate = files.find(f => f.name === file);
      
      if (fileToUpdate) {
        setProgress(
          fileToUpdate.id,
          fileProgress,
          status,
          transcriptId,
          error
        );
        
        if (error) {
          setHasError(true);
        }
      }
    };
    
    // Subscribe to bulk upload progress events
    const unsubscribe = EventsService.addEventListener(
      'bulk-upload-progress' as EventType,
      handleBulkUploadProgress
    );
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [files, setProgress]);
  
  return {
    files,
    isProcessing,
    progress,
    hasError,
    start,
    complete,
    setProgress,
    addTranscript,
    setFileCount
  };
};

// Hook to access the bulk upload store with history loading
export const useBulkUpload = () => {
  const {
    uploadState,
    progress,
    transcripts,
    fileCount,
    refreshTranscripts
  } = useBulkUploadStore();
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Load transcripts on mount
  useEffect(() => {
    const loadTranscripts = async () => {
      await refreshTranscripts();
      setIsLoading(false);
    };
    
    loadTranscripts();
  }, [refreshTranscripts]);
  
  return {
    uploadState,
    progress,
    transcripts,
    fileCount,
    isLoading,
    refreshTranscripts
  };
};
