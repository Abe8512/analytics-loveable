
import { useState, useEffect } from 'react';
import { BulkUploadService } from '@/services/BulkUploadService';
import { BulkUploadFilter } from '@/types/teamTypes';
import { useEventListener } from '@/services/events/hooks';

export const useBulkUploadService = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for file status updates
  useEventListener('bulk-upload-status-change', (payload) => {
    if (payload && payload.files) {
      setFiles(payload.files);
    }
  });

  // Listen for upload completion
  useEventListener('bulk-upload-completed', () => {
    refreshTranscripts();
  });

  const refreshTranscripts = async (filters?: BulkUploadFilter) => {
    setIsLoading(true);
    try {
      const transcriptions = await BulkUploadService.getTranscriptions(filters);
      setFiles(transcriptions || []);
      return transcriptions;
    } catch (error) {
      console.error('Error refreshing transcriptions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await BulkUploadService.processFile(file);
      await refreshTranscripts();
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    refreshTranscripts();
  }, []);

  return {
    files,
    isLoading,
    uploadFile,
    refreshTranscripts
  };
};
