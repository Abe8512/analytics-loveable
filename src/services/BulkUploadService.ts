
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { dispatchEvent } from '@/services/events/store';
import { EventType } from '@/services/events/types';
import { BulkUploadFile, BulkUploadTranscript, BulkUploadFilter, UploadState } from '@/types/bulkUpload';

class BulkUploadService {
  private _files: BulkUploadFile[] = [];
  private _isProcessing = false;
  private _uploadHistory: any[] = [];
  private _hasLoadedHistory = false;
  private _progress = 0;
  private _uploadState: UploadState = 'idle';
  private _transcripts: BulkUploadTranscript[] = [];
  private _assignedUserId: string = '';

  get files() {
    return this._files;
  }

  get isProcessing() {
    return this._isProcessing;
  }

  get uploadHistory() {
    return this._uploadHistory;
  }

  get hasLoadedHistory() {
    return this._hasLoadedHistory;
  }

  get progress() {
    return this._progress;
  }

  get uploadState() {
    return this._uploadState;
  }

  get transcripts() {
    return this._transcripts;
  }

  setAssignedUserId(userId: string) {
    this._assignedUserId = userId;
  }

  addFiles(files: File[]) {
    const newFiles = files.map(file => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: 'queued' as const,
    }));
    
    this._files = [...this._files, ...newFiles];
    return newFiles;
  }

  setProgress(fileId: string, progress: number, status?: string, transcriptId?: string, error?: string) {
    this._files = this._files.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          progress,
          status: status as any || file.status,
          transcriptId,
          error
        };
      }
      return file;
    });
    
    // Update overall progress
    const totalProgress = this._files.reduce((acc, file) => acc + file.progress, 0);
    this._progress = totalProgress / this._files.length;
  }

  async processQueue() {
    if (this._isProcessing || this._files.length === 0) {
      return;
    }
    
    this._isProcessing = true;
    this._uploadState = 'uploading';
    dispatchEvent('bulk-upload-started' as EventType);
    
    // Process files in sequence
    for (const file of this._files) {
      if (file.status === 'queued') {
        try {
          // Update file status to uploading
          this.setProgress(file.id, 10, 'uploading');
          
          // Simulate upload process
          await new Promise(resolve => setTimeout(resolve, 1000));
          this.setProgress(file.id, 50, 'processing');
          
          // Simulate processing
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Complete the file
          const transcriptId = uuidv4();
          this.setProgress(file.id, 100, 'complete', transcriptId);
          
          // Dispatch event for this file
          dispatchEvent('bulk-upload-progress' as EventType, {
            file: file.file.name,
            progress: 100,
            status: 'complete',
            transcriptId
          });
        } catch (error: any) {
          console.error("Error processing file:", error);
          this.setProgress(file.id, 0, 'error', undefined, error.message);
          
          // Dispatch error event
          dispatchEvent('bulk-upload-progress' as EventType, {
            file: file.file.name,
            progress: 0,
            status: 'error',
            error: error.message
          });
        }
      }
    }
    
    // Check if all files are complete
    const allComplete = this._files.every(file => 
      file.status === 'complete' || file.status === 'error'
    );
    
    if (allComplete) {
      this._uploadState = 'complete';
      dispatchEvent('bulk-upload-completed' as EventType, {
        timestamp: Date.now()
      });
    }
    
    this._isProcessing = false;
  }
  
  async refreshTranscripts(filters?: BulkUploadFilter): Promise<BulkUploadTranscript[]> {
    try {
      // Here would be the actual code to fetch from Supabase
      // For now, let's use some mock data
      this._transcripts = Array(5).fill(null).map((_, i) => ({
        id: uuidv4(),
        filename: `call_recording_${i + 1}.mp3`,
        text: `This is a transcript for call ${i + 1}`,
        created_at: new Date().toISOString(),
        duration: Math.floor(Math.random() * 600) + 60, // 1-10 minutes
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        keywords: ['pricing', 'feature', 'support']
      }));
      
      return this._transcripts;
    } catch (error) {
      console.error("Error refreshing transcripts:", error);
      return [];
    }
  }

  start() {
    // Reset progress and state
    this._progress = 0;
    this._uploadState = 'idle';
  }

  complete() {
    // Clean up after upload
    this._files = [];
    this._progress = 0;
    this._uploadState = 'idle';
  }
  
  setFileCount(count: number) {
    // Used to update file count for pagination
    console.log(`Setting file count to ${count}`);
  }
}

// Export a singleton instance
export const bulkUploadService = new BulkUploadService();

// Export a hook for components to use
export const useBulkUploadService = () => {
  return bulkUploadService;
};
