
import { UploadStatus } from "@/store/useBulkUploadStore";
import { toast } from "sonner";
import { BulkUploadProcessorService } from "../BulkUploadProcessorService";
import { CallTranscriptFilter } from "../CallTranscriptService";

interface BulkUploadFile {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  result?: string;
  error?: string;
  transcriptId?: string;
}

interface ProcessBulkUploadParams {
  files: BulkUploadFile[];
  updateFileStatus: (
    id: string, 
    status: UploadStatus, 
    progress: number, 
    result?: string, 
    error?: string, 
    transcriptId?: string
  ) => void;
  dispatchEvent: (type: string, payload?: any) => void;
  bulkUploadProcessor: BulkUploadProcessorService;
  fetchTranscripts: (options?: CallTranscriptFilter) => Promise<any>;
  debouncedLoadHistory: () => void;
}

/**
 * Utility functions for bulk upload operations
 */
export class BulkUploadUtils {
  /**
   * Process multiple files in bulk
   */
  static async processBulkUpload({
    files,
    updateFileStatus,
    dispatchEvent,
    bulkUploadProcessor,
    fetchTranscripts,
    debouncedLoadHistory
  }: ProcessBulkUploadParams): Promise<void> {
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
      return;
    }
    
    // Process files one by one
    for (let i = 0; i < queuedFiles.length; i++) {
      const file = queuedFiles[i];
      console.log(`Processing file ${i+1}/${queuedFiles.length}: ${file.file.name}`);
      
      try {
        // Define a callback function that accepts multiple parameters
        const progressCallback = (
          status: UploadStatus, 
          progress: number, 
          result?: string, 
          error?: string, 
          transcriptId?: string
        ) => {
          console.log(`File ${file.file.name} status update: ${status}, progress: ${progress}%, result: ${result?.slice(0, 50)}${result?.length > 50 ? '...' : ''}`);
          updateFileStatus(file.id, status, progress, result, error, transcriptId);
        };
        
        await bulkUploadProcessor.processFile(file.file, progressCallback);
        
        if (i < queuedFiles.length - 1) {
          toast.success(`Processed file ${i+1}/${queuedFiles.length}`, {
            description: file.file.name,
            duration: 3000,
          });
        }
        
        // Small delay between files to prevent overloading the API
        if (i < queuedFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Error processing file ${file.file.name}:`, error);
        updateFileStatus(file.id, 'error', 0, undefined, 
          error instanceof Error ? error.message : 'Unknown error during processing');
      }
    }
    
    console.log('All files processed, refreshing history and transcript data');
    await debouncedLoadHistory();
    
    // Force refresh transcripts to show latest data
    await fetchTranscripts({ force: true });
    
    // Dispatch custom event for cross-component communication
    dispatchEvent('bulk-upload-completed', {
      fileCount: files.length,
      fileIds: files.map(f => f.id),
      transcriptIds: files.filter(f => f.transcriptId).map(f => f.transcriptId)
    });
    
    toast.success("All files processed", {
      description: "Your data has been uploaded and metrics have been updated."
    });
  }
}
