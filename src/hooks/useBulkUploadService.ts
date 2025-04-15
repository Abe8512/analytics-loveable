
import { useState, useCallback } from 'react';
import { BulkUploadService } from '@/services/BulkUploadService';

export const useBulkUploadService = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  
  const uploadFile = useCallback(async (file: File, options?: any) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      const result = await BulkUploadService.uploadFile(file, {
        ...options,
        onProgress: (progress: number) => {
          setUploadProgress(progress);
        }
      });
      
      setUploadProgress(100);
      setIsUploading(false);
      return result;
    } catch (error) {
      setUploadError(error instanceof Error ? error : new Error('Upload failed'));
      setIsUploading(false);
      throw error;
    }
  }, []);
  
  const cancelUpload = useCallback(() => {
    BulkUploadService.cancelUpload();
    setIsUploading(false);
    setUploadProgress(0);
  }, []);
  
  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadFile,
    cancelUpload,
    ...BulkUploadService
  };
};

export default useBulkUploadService;
