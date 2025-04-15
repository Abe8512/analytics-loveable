
import { useEffect, useState } from 'react';
import { BulkUploadService } from '@/services/BulkUploadService';
import { BulkUploadFilter } from '@/types/teamTypes';
import { BulkUploadFile } from '@/types/bulkUpload';

// Create a custom hook to provide bulk upload functionality
export function useBulkUploadService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [files, setFiles] = useState<BulkUploadFile[]>([]);
  
  // Initialize service once
  const service = BulkUploadService;
  
  // Update files state when BulkUploadService files change
  useEffect(() => {
    setFiles(service.files);
    
    // Listen for file changes
    const handleFilesChanged = () => {
      setFiles([...service.files]);
    };
    
    // Subscribe to file changes
    service.subscribeToFileChanges(handleFilesChanged);
    
    // Cleanup
    return () => {
      service.unsubscribeFromFileChanges(handleFilesChanged);
    };
  }, [service]);
  
  // Wrapper for refreshTranscripts
  const refreshTranscripts = async (filter?: BulkUploadFilter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await service.refreshTranscripts(filter);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error refreshing transcripts'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Wrapper for uploadFile
  const uploadFile = async (file: File, assignTo?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await service.uploadFile(file, assignTo);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error uploading file'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    files,
    isLoading,
    error,
    refreshTranscripts,
    uploadFile,
    clearFiles: service.clearFiles,
    removeFile: service.removeFile,
    assignRepToFile: service.assignRepToFile
  };
}

export default useBulkUploadService;
