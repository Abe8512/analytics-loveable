
import { v4 as uuidv4 } from 'uuid';
import { EventsStore } from './events/store';
import { EventType } from './events/types';
import { supabase } from '@/integrations/supabase/client';

class BulkUploadServiceClass {
  private isUploading = false;
  private uploadController: AbortController | null = null;
  private assignedUserId: string = '';

  setAssignedUserId(userId: string) {
    this.assignedUserId = userId;
  }

  getAssignedUserId() {
    return this.assignedUserId;
  }

  async uploadFile(file: File, options?: {
    onProgress?: (progress: number) => void;
    onComplete?: (result: any) => void;
    onError?: (error: Error) => void;
  }): Promise<any> {
    if (this.isUploading) {
      throw new Error('Another upload is already in progress');
    }

    this.isUploading = true;
    this.uploadController = new AbortController();
    const { signal } = this.uploadController;

    try {
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += 10;
          options?.onProgress?.(progress);
        }
      }, 300);

      // Check if signal is aborted
      if (signal.aborted) {
        clearInterval(progressInterval);
        throw new Error('Upload cancelled');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a unique ID for the transcript
      const transcriptId = uuidv4();

      // For now, create a mock result
      const result = {
        id: transcriptId,
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        assignedTo: this.assignedUserId || undefined
      };

      clearInterval(progressInterval);
      options?.onProgress?.(100);
      options?.onComplete?.(result);

      this.isUploading = false;
      this.uploadController = null;

      return result;
    } catch (error) {
      this.isUploading = false;
      this.uploadController = null;

      if (error instanceof Error) {
        options?.onError?.(error);
        throw error;
      } else {
        const genericError = new Error('Unknown upload error');
        options?.onError?.(genericError);
        throw genericError;
      }
    }
  }

  cancelUpload() {
    if (this.uploadController) {
      this.uploadController.abort();
      this.isUploading = false;
      this.uploadController = null;
      return true;
    }
    return false;
  }

  isUploadInProgress() {
    return this.isUploading;
  }
}

export const BulkUploadService = new BulkUploadServiceClass();
