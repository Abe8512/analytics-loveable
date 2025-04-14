
import { useState, useEffect } from 'react';
import { BulkUploadService } from '@/services/BulkUploadService';
import { BulkUploadFilter } from '@/types/teamTypes';
import { useEventListener } from '@/services/events/hooks';
import { v4 as uuidv4 } from 'uuid';

export interface BulkUploadFile {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'processing' | 'complete' | 'error';
  progress?: number;
  error?: Error;
  result?: any;
}

export const useBulkUploadService = () => {
  const [files, setFiles] = useState<BulkUploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [assignedUserId, setAssignedUserId] = useState<string>('');

  // Listen for upload completion
  useEventListener('bulk-upload-completed', () => {
    refreshTranscripts();
  });

  const refreshTranscripts = async (filters?: BulkUploadFilter) => {
    setIsLoading(true);
    try {
      const transcriptions = await BulkUploadService.getTranscriptions(filters);
      setUploadHistory(transcriptions || []);
      setHasLoadedHistory(true);
      return transcriptions;
    } catch (error) {
      console.error('Error refreshing transcriptions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const filesWithIds: BulkUploadFile[] = newFiles.map(file => ({
      id: uuidv4(),
      file,
      status: 'queued'
    }));
    
    setFiles(prev => [...prev, ...filesWithIds]);
    return filesWithIds;
  };

  const processQueue = async () => {
    if (files.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    
    // Process files one by one
    for (const file of files) {
      // Update status to uploading
      setFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, status: 'uploading' } : f)
      );
      
      try {
        // Process the file
        await BulkUploadService.processFile(file.file);
        
        // Update status to complete
        setFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, status: 'complete' } : f)
        );
      } catch (error) {
        console.error(`Error processing file ${file.file.name}:`, error);
        // Update status to error
        setFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, status: 'error', error: error as Error } : f)
        );
      }
    }
    
    setIsProcessing(false);
    
    // Dispatch event that all uploads are complete
    const event = new CustomEvent('bulk-upload-completed');
    window.dispatchEvent(event);
  };

  // Initial fetch
  useEffect(() => {
    refreshTranscripts();
  }, []);

  return {
    files,
    isLoading,
    isProcessing,
    uploadHistory,
    hasLoadedHistory,
    addFiles,
    processQueue,
    refreshTranscripts,
    setAssignedUserId,
    assignedUserId
  };
};
