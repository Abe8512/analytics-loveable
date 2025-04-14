
// Re-export from the new file structure
import { useBulkUpload } from './bulk-upload/BulkUploadHooks';
export * from './bulk-upload/BulkUploadUtils';
export type { BulkUploadFilter } from '@/types/team';

// Create a wrapper for useBulkUpload that adds additional functionality
export const useBulkUploadService = () => {
  const bulkUploadHook = useBulkUpload();
  const store = useBulkUploadStore();
  
  // Add additional methods that may be used by components
  return {
    ...bulkUploadHook,
    files: store.files,
    isProcessing: store.isProcessing,
    uploadHistory: store.uploadHistory,
    hasLoadedHistory: store.hasLoadedHistory,
    processQueue: () => {
      if (store.acquireProcessingLock()) {
        bulkUploadHook.startUpload();
        // Process files logic would go here
        store.setProcessing(true);
        // After processing
        setTimeout(() => {
          store.releaseProcessingLock();
          bulkUploadHook.completeUpload();
        }, 1000);
      }
    },
    addFiles: store.addFiles,
    refreshTranscripts: async (filters?: BulkUploadFilter) => {
      await store.loadUploadHistory();
      return store.uploadHistory;
    },
    setAssignedUserId: (userId: string) => {
      // Implementation would depend on how you track assigned user
      console.log('Setting assigned user ID:', userId);
    }
  };
};

// Import this at the top level to avoid circular references
import { useBulkUploadStore } from '@/store/useBulkUploadStore';
