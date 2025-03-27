
import { useCallback, useEffect } from 'react';
import { useBulkUploadStore, UploadStatus } from "@/store/useBulkUploadStore";
import { useWhisperService } from "@/services/WhisperService";
import { toast } from "sonner";
import { useEventsStore } from "@/services/events";
import { BulkUploadProcessorService } from "../BulkUploadProcessorService";
import { debounce } from "lodash";
import { errorHandler } from "../ErrorHandlingService";
import { useCallTranscripts, CallTranscriptFilter } from "../CallTranscriptService";
import { BulkUploadUtils } from "./BulkUploadUtils";

export interface BulkUploadFilter {
  force?: boolean;
}

/**
 * Hook providing bulk upload functionality
 */
export const useBulkUploadService = () => {
  const whisperService = useWhisperService();
  const bulkUploadProcessor = new BulkUploadProcessorService();
  const { fetchTranscripts } = useCallTranscripts();
  const { 
    files, 
    addFiles, 
    updateFileStatus, 
    removeFile, 
    clearCompleted, 
    isProcessing,
    setProcessing,
    loadUploadHistory,
    uploadHistory,
    hasLoadedHistory,
    acquireProcessingLock,
    releaseProcessingLock
  } = useBulkUploadStore();
  const dispatchEvent = useEventsStore.getState().dispatchEvent;
  
  const setAssignedUserId = useCallback((userId: string) => {
    console.log('Setting assigned user ID:', userId);
    bulkUploadProcessor.setAssignedUserId(userId);
  }, [bulkUploadProcessor]);
  
  const debouncedLoadHistory = debounce(() => {
    console.log('Loading upload history...');
    loadUploadHistory().catch(error => {
      console.error('Failed to load upload history:', error);
      errorHandler.handleError(error, 'BulkUploadService.loadUploadHistory');
    });
  }, 300);
  
  // Load history on initial mount
  useEffect(() => {
    if (!hasLoadedHistory) {
      debouncedLoadHistory();
    }
  }, [hasLoadedHistory, debouncedLoadHistory]);
  
  // Process files in queue
  const processQueue = useCallback(async () => {
    if (isProcessing || files.length === 0) {
      console.log('Skipping processQueue: already processing or no files');
      return;
    }
    
    if (!acquireProcessingLock()) {
      console.log('Failed to acquire processing lock, another process is already running');
      toast.info("Upload processing is already in progress");
      return;
    }
    
    // Check for API key if not using local Whisper
    if (!whisperService.getUseLocalWhisper() && !whisperService.getOpenAIKey()) {
      console.error('OpenAI API key missing');
      toast.error("OpenAI API Key Missing", {
        description: "Please add your OpenAI API key in Settings before processing files."
      });
      releaseProcessingLock();
      return;
    }
    
    console.log(`Starting to process ${files.length} files`);
    
    try {
      setProcessing(true);
      
      await BulkUploadUtils.processBulkUpload({
        files,
        updateFileStatus,
        dispatchEvent,
        bulkUploadProcessor,
        fetchTranscripts,
        debouncedLoadHistory
      });
      
    } catch (error) {
      console.error('Bulk processing error:', error);
      errorHandler.handleError(error, 'BulkUploadService.processQueue');
      
      toast.error("Processing failed", {
        description: "There was an error processing some files. Please try again.",
      });
    } finally {
      console.log('Finishing bulk upload process, releasing lock');
      setProcessing(false);
      releaseProcessingLock();
    }
  }, [
    isProcessing, 
    files, 
    acquireProcessingLock, 
    whisperService, 
    setProcessing, 
    updateFileStatus, 
    dispatchEvent, 
    bulkUploadProcessor, 
    fetchTranscripts, 
    debouncedLoadHistory, 
    releaseProcessingLock
  ]);
  
  const refreshTranscripts = useCallback(async (filter?: BulkUploadFilter) => {
    try {
      console.log('Refreshing transcripts with filter:', filter);
      const transcriptFilter: CallTranscriptFilter = {
        force: filter?.force || false
      };
      
      await fetchTranscripts(transcriptFilter);
    } catch (error) {
      console.error('Failed to refresh transcripts:', error);
      errorHandler.handleError(error, 'BulkUploadService.refreshTranscripts');
    }
  }, [fetchTranscripts]);
  
  return {
    files,
    addFiles,
    updateFileStatus,
    removeFile,
    clearCompleted,
    isProcessing,
    processQueue,
    uploadHistory,
    hasLoadedHistory,
    loadUploadHistory: debouncedLoadHistory,
    setAssignedUserId,
    acquireProcessingLock,
    releaseProcessingLock,
    refreshTranscripts
  };
};
