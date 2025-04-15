
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { BulkUploadFile, BulkUploadFilter } from '@/types/bulkUpload';
import { EventsStore } from './events/store';
import { EventType } from './events/types';

class BulkUploadServiceClass {
  private _files: BulkUploadFile[] = [];
  private _fileChangeListeners: Function[] = [];
  private _assignedUserId: string | null = null;
  
  /**
   * Get the current list of files
   */
  get files() {
    return this._files;
  }
  
  /**
   * Set the user ID to assign uploaded files to
   */
  setAssignedUserId(userId: string) {
    this._assignedUserId = userId;
  }
  
  /**
   * Subscribe to file changes
   * @param callback Function to call when files change
   */
  subscribeToFileChanges(callback: Function) {
    this._fileChangeListeners.push(callback);
    return () => this.unsubscribeFromFileChanges(callback);
  }
  
  /**
   * Unsubscribe from file changes
   * @param callback Function to remove from listeners
   */
  unsubscribeFromFileChanges(callback: Function) {
    this._fileChangeListeners = this._fileChangeListeners.filter(cb => cb !== callback);
  }
  
  /**
   * Notify listeners of file changes
   */
  private notifyFileChanges() {
    this._fileChangeListeners.forEach(callback => callback());
  }
  
  /**
   * Add files to the queue
   * @param newFiles Files to add
   */
  addFiles(newFiles: File[]) {
    const filesToAdd = newFiles.map(file => ({
      id: uuidv4(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'queued' as const,
      progress: 0,
      assignedTo: this._assignedUserId || undefined
    }));
    
    this._files = [...this._files, ...filesToAdd];
    this.notifyFileChanges();
    return this._files;
  }
  
  /**
   * Clear all files from the queue
   */
  clearFiles = () => {
    this._files = [];
    this.notifyFileChanges();
  }
  
  /**
   * Remove a file from the queue
   * @param id ID of the file to remove
   */
  removeFile = (id: string) => {
    this._files = this._files.filter(file => file.id !== id);
    this.notifyFileChanges();
  }
  
  /**
   * Assign a rep to a file
   * @param fileId ID of the file to update
   * @param repId ID of the rep to assign
   */
  assignRepToFile = (fileId: string, repId: string) => {
    this._files = this._files.map(file => 
      file.id === fileId 
        ? { ...file, assignedTo: repId } 
        : file
    );
    this.notifyFileChanges();
  }
  
  /**
   * Update the status of a file
   * @param id ID of the file to update
   * @param progress Progress (0-100)
   * @param status New status
   * @param transcriptId Optional ID of the transcript
   * @param error Optional error message
   */
  updateFileStatus(id: string, progress: number, status: BulkUploadFile['status'], transcriptId?: string, error?: string) {
    this._files = this._files.map(file => 
      file.id === id 
        ? { 
            ...file, 
            progress, 
            status, 
            transcriptId, 
            error 
          } 
        : file
    );
    this.notifyFileChanges();
    
    // Dispatch an event for progress updates
    EventsStore.dispatchEvent('bulk-upload-progress' as EventType, {
      file: this._files.find(f => f.id === id)?.name,
      progress,
      status,
      transcriptId,
      error
    });
    
    // Check if all files are processed
    const allProcessed = this._files.every(f => 
      f.status === 'complete' || f.status === 'error'
    );
    
    if (allProcessed && this._files.length > 0) {
      setTimeout(() => {
        // Dispatch a custom event for completion
        const event = new CustomEvent('bulk-upload-completed');
        window.dispatchEvent(event);
      }, 500);
    }
  }
  
  /**
   * Process all queued files
   */
  processQueue = async () => {
    const queuedFiles = this._files.filter(file => file.status === 'queued');
    
    if (queuedFiles.length === 0) return;
    
    // Process files sequentially to avoid overwhelming the server
    for (const file of queuedFiles) {
      try {
        this.updateFileStatus(file.id, 10, 'processing');
        
        // Upload the file
        const result = await this.uploadFile(file.file, file.assignedTo);
        
        // Update the file status
        this.updateFileStatus(
          file.id, 
          100, 
          'complete', 
          result.transcriptId
        );
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        this.updateFileStatus(
          file.id, 
          0, 
          'error', 
          undefined, 
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }
  
  /**
   * Uploads a file to the storage bucket and processes it
   * @param file The file to upload
   * @param assignTo Optional user ID to assign the transcript to
   * @returns The processed file information
   */
  async uploadFile(file: File, assignTo?: string): Promise<{ path: string, transcriptId: string }> {
    try {
      // Create a unique filename
      const filename = `${uuidv4()}-${file.name}`;
      
      // Upload to Supabase storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('call-recordings')
        .upload(filename, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }
      
      const filePath = fileData?.path;
      
      if (!filePath) {
        throw new Error('File upload failed: No path returned');
      }
      
      // Call the transcription function
      const { data, error: transcribeError } = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          filePath,
          assignTo,
          force: true
        }
      });
      
      if (transcribeError) {
        console.error('Error invoking transcribe function:', transcribeError);
        throw transcribeError;
      }
      
      if (!data?.transcriptId) {
        throw new Error('Transcription failed: No transcript ID returned');
      }
      
      console.log('Transcription complete:', data);
      
      return {
        path: filePath,
        transcriptId: data.transcriptId
      };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }
  
  /**
   * Gets a list of transcriptions from the database
   * @param filters Optional filters for the query
   * @returns Array of transcriptions
   */
  async refreshTranscripts(filters?: BulkUploadFilter): Promise<boolean> {
    try {
      let query = supabase
        .from('call_transcripts')
        .select('*');
      
      // Apply filters
      if (filters) {
        // Apply limit and offset if provided
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        
        if (filters.offset) {
          query = query.range(
            filters.offset, 
            filters.offset + (filters.limit || 10) - 1
          );
        }
        
        // Apply sorting
        if (filters.sortBy) {
          const order = filters.sortDirection || 'desc';
          query = query.order(filters.sortBy, { ascending: order === 'asc' });
        } else {
          // Default sort by created_at
          query = query.order('created_at', { ascending: false });
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching transcriptions:', error);
        throw error;
      }
      
      // Dispatch an event with the data
      EventsStore.dispatchEvent('transcripts-refreshed' as EventType, {
        transcripts: data || [],
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error in refreshTranscripts:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const BulkUploadService = new BulkUploadServiceClass();
