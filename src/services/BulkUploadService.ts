
// Re-export from the new file structure
import { useBulkUpload } from './bulk-upload/BulkUploadHooks';
export * from './bulk-upload/BulkUploadUtils';
export type { BulkUploadFilter } from '@/types/teamTypes';

// Type for files being uploaded 
export interface BulkUploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

// Store interface
export interface BulkUploadStore {
  files: BulkUploadFile[];
  isProcessing: boolean;
  uploadHistory: any[];
  hasLoadedHistory: boolean;
  
  // Actions
  processQueue: () => void;
  addFiles: (files: File[]) => void;
  refreshTranscripts: (filters?: BulkUploadFilter) => Promise<any[]>;
  setAssignedUserId: (userId: string) => void;
  
  // For bulk upload hooks
  acquireProcessingLock: () => boolean;
  releaseProcessingLock: () => void;
  setProcessing: (processing: boolean) => void;
  loadUploadHistory: () => Promise<void>;
  
  // Additional methods from BulkUploadHooks
  start: () => void;
  complete: () => void;
  setProgress: (progress: number) => void;
  addTranscript: (transcript: any) => void;
  setFileCount: (count: number) => void;
}

// Create a wrapper for useBulkUpload that adds additional functionality
export const useBulkUploadService = (): BulkUploadStore => {
  const bulkUploadHook = useBulkUpload();
  const store = useBulkUploadStore();
  
  return {
    ...bulkUploadHook,
    ...store,
    files: store.files,
    isProcessing: store.isProcessing,
    uploadHistory: store.uploadHistory,
    hasLoadedHistory: store.hasLoadedHistory,
    processQueue: () => {
      if (store.acquireProcessingLock()) {
        bulkUploadHook.start();
        store.setProcessing(true);
        setTimeout(() => {
          store.releaseProcessingLock();
          bulkUploadHook.complete();
        }, 1000);
      }
    },
    addFiles: store.addFiles,
    refreshTranscripts: async (filters?: BulkUploadFilter) => {
      await store.loadUploadHistory();
      return store.uploadHistory;
    },
    setAssignedUserId: (userId: string) => {
      console.log('Setting assigned user ID:', userId);
    }
  };
};

// Import this at the top level to avoid circular references
import { useBulkUploadStore } from '@/store/useBulkUploadStore';
