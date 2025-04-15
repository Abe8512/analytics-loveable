
import { useEffect, useState } from 'react';
import { BulkUploadService } from '@/services/BulkUploadService';
import { BulkUploadFilter, BulkUploadFile, BulkUploadHistoryItem } from '@/types/bulkUpload';
import { supabase } from '@/integrations/supabase/client';

// Create a custom hook to provide bulk upload functionality
export function useBulkUploadService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [files, setFiles] = useState<BulkUploadFile[]>([]);
  const [uploadHistory, setUploadHistory] = useState<BulkUploadHistoryItem[]>([]);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  
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
  
  // Load upload history
  useEffect(() => {
    if (!hasLoadedHistory) {
      fetchUploadHistory();
    }
  }, [hasLoadedHistory]);
  
  // Fetch upload history from database
  const fetchUploadHistory = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('id, filename, created_at, duration, sentiment, keywords, text')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setUploadHistory(data || []);
      setHasLoadedHistory(true);
    } catch (err) {
      console.error('Error fetching upload history:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching history'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Wrapper for refreshTranscripts
  const refreshTranscripts = async (filter?: BulkUploadFilter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await service.refreshTranscripts(filter);
      await fetchUploadHistory();
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
      await fetchUploadHistory();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error uploading file'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Wrapper for addFiles
  const addFiles = (files: File[]) => {
    return service.addFiles(files);
  };
  
  // Wrapper for processQueue
  const processQueue = async () => {
    setIsLoading(true);
    
    try {
      await service.processQueue();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error processing queue'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Wrapper for setAssignedUserId
  const setAssignedUserId = (userId: string) => {
    service.setAssignedUserId(userId);
  };
  
  return {
    files,
    isLoading,
    error,
    refreshTranscripts,
    uploadFile,
    clearFiles: service.clearFiles,
    removeFile: service.removeFile,
    assignRepToFile: service.assignRepToFile,
    addFiles,
    processQueue,
    isProcessing: isLoading,
    uploadHistory,
    hasLoadedHistory,
    setAssignedUserId
  };
}

export default useBulkUploadService;
