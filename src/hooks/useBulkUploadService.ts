
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BulkUploadService } from '@/services/BulkUploadService';
import { BulkUploadFilter } from '@/types/bulkUpload';
import { supabase } from '@/integrations/supabase/client';

export const useBulkUploadService = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  
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
  
  const addFiles = useCallback((newFiles: File[]) => {
    const fileObjects = newFiles.map(file => ({
      id: uuidv4(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'queued' as const,
      progress: 0,
    }));
    
    setFiles(prevFiles => [...prevFiles, ...fileObjects]);
  }, []);
  
  const processQueue = useCallback(() => {
    setIsProcessing(true);
    
    // This would normally process the files
    // For now, just update the state after a delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  }, []);
  
  const setAssignedUserId = useCallback((userId: string) => {
    BulkUploadService.setAssignedUserId(userId);
  }, []);
  
  const refreshTranscripts = useCallback(async (filters?: BulkUploadFilter) => {
    try {
      let query = supabase
        .from('call_transcripts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setUploadHistory(data || []);
      setHasLoadedHistory(true);
      return data || [];
    } catch (err) {
      console.error('Error fetching transcripts:', err);
      return [];
    }
  }, []);
  
  // Load transcripts on first mount
  useEffect(() => {
    if (!hasLoadedHistory) {
      refreshTranscripts();
    }
  }, [hasLoadedHistory, refreshTranscripts]);
  
  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadFile,
    cancelUpload,
    files,
    addFiles,
    processQueue,
    isProcessing,
    uploadHistory,
    hasLoadedHistory,
    refreshTranscripts,
    setAssignedUserId,
    ...BulkUploadService
  };
};

export default useBulkUploadService;
