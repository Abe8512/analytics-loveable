
import { useBulkUploadStore, UploadStatus } from "@/store/useBulkUploadStore";
import { useWhisperService } from "@/services/WhisperService";
import { toast } from "sonner";
import { useEventsStore } from "@/services/events";
import { BulkUploadProcessorService } from "./BulkUploadProcessorService";
import { debounce } from "lodash";
import { errorHandler } from "./ErrorHandlingService";
import { useCallTranscripts, CallTranscriptFilter } from "./CallTranscriptService";

export interface BulkUploadFilter {
  force?: boolean;
}

export const useBulkUploadService = () => {
  const whisperService = useWhisperService();
  const bulkUploadProcessor = new BulkUploadProcessorService(whisperService);
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
  
  const setAssignedUserId = (userId: string) => {
    console.log('Setting assigned user ID:', userId);
    bulkUploadProcessor.setAssignedUserId(userId);
  };
  
  const debouncedLoadHistory = debounce(() => {
    console.log('Loading upload history...');
    loadUploadHistory().catch(error => {
      console.error('Failed to load upload history:', error);
      errorHandler.handleError(error, 'BulkUploadService.loadUploadHistory');
    });
  }, 300);
  
  const processQueue = async () => {
    console.log('BulkUploadService: processQueue called');
    console.log('Files in queue:', files.length);
    console.log('Current processing state:', isProcessing);
    
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
      
      dispatchEvent('bulk-upload-started', {
        fileCount: files.filter(f => f.status === 'queued' || f.status === 'processing').length,
        fileIds: files.map(file => file.id)
      });
      
      const queuedFiles = files.filter(file => 
        file.status === 'queued' || 
        (file.status === 'error' && file.progress === 0)
      );
      
      console.log(`Found ${queuedFiles.length} files to process in queue`);
      
      if (queuedFiles.length === 0) {
        toast.info("No files to process", {
          description: "All files have already been processed or are currently processing."
        });
        setProcessing(false);
        releaseProcessingLock();
        return;
      }
      
      for (let i = 0; i < queuedFiles.length; i++) {
        const file = queuedFiles[i];
        console.log(`Processing file ${i+1}/${queuedFiles.length}: ${file.file.name}`);
        
        try {
          await bulkUploadProcessor.processFile(
            file.file,
            (status, progress, result, error, transcriptId) => {
              console.log(`File ${file.file.name} status update: ${status}, progress: ${progress}%, result: ${result?.slice(0, 50)}${result?.length > 50 ? '...' : ''}`);
              updateFileStatus(file.id, status, progress, result, error, transcriptId);
            }
          );
          
          if (i < queuedFiles.length - 1) {
            toast.success(`Processed file ${i+1}/${queuedFiles.length}`, {
              description: file.file.name,
              duration: 3000,
            });
          }
          
          if (i < queuedFiles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (error) {
          console.error(`Error processing file ${file.file.name}:`, error);
          errorHandler.handleError(error, 'BulkUploadService.processFile');
          updateFileStatus(file.id, 'error', 0, undefined, 
            error instanceof Error ? error.message : 'Unknown error during processing');
        }
      }
      
      console.log('All files processed, refreshing history and transcript data');
      await debouncedLoadHistory();
      
      await fetchTranscripts({ force: true });
      
      window.dispatchEvent(new CustomEvent('transcriptions-updated'));
      
      dispatchEvent('bulk-upload-completed', {
        fileCount: files.length,
        fileIds: files.map(f => f.id),
        transcriptIds: files.filter(f => f.transcriptId).map(f => f.transcriptId)
      });
      
      toast.success("All files processed", {
        description: "Your data has been uploaded and metrics have been updated."
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
  };
  
  const refreshTranscripts = async (filter?: BulkUploadFilter) => {
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
  };
  
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
