
import { useState, useEffect } from 'react';
import { useBulkUploadStore } from '@/store/useBulkUploadStore';
import { BulkUploadState } from '@/types/team';
import { CallTranscript } from '@/types/call';
import { EventsStore } from '@/services/events/store';
import { EventType } from '@/services/events/types';

interface BulkUploadHookResult {
  uploadState: BulkUploadState;
  transcripts: CallTranscript[];
  progress: number;
  fileCount: number;
  startUpload: () => void;
  completeUpload: () => void;
  updateProgress: (progress: number) => void;
  addTranscript: (transcript: CallTranscript) => void;
  setFileCount: (count: number) => void;
}

export const useBulkUpload = (): BulkUploadHookResult => {
  const [uploadState, setUploadState] = useState<BulkUploadState>('idle');
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [fileCount, setFileCount] = useState<number>(0);

  // Use store methods directly without wrapping
  const store = useBulkUploadStore();

  // Local actions
  const startUpload = () => {
    setUploadState('uploading');
    // Use setProcessing instead of start
    store.setProcessing(true);
    EventsStore.dispatchEvent('bulk-upload-started' as EventType);
  };

  const completeUpload = () => {
    setUploadState('complete');
    // Use setProcessing instead of complete
    store.setProcessing(false);
    EventsStore.dispatchEvent('bulk-upload-completed' as EventType, { data: { fileCount } });
  };

  const updateProgress = (progress: number) => {
    setProgress(progress);
    // We don't have direct setProgress access, so update files instead
    if (store.files.length > 0) {
      store.files.forEach(file => {
        store.updateFileStatus(file.id, file.status, progress, file.result, file.error, file.transcriptId);
      });
    }
    EventsStore.dispatchEvent('bulk-upload-progress' as EventType, { data: { progress } });
  };

  const addTranscript = (transcript: CallTranscript) => {
    setTranscripts((prev) => [...prev, transcript]);
    // No direct addTranscript in the store
  };

  const setFileCountAction = (count: number) => {
    setFileCount(count);
    // No direct setFileCount in the store
  };

  // Subscribe to Zustand state changes
  useEffect(() => {
    const unsubscribe = useBulkUploadStore.subscribe((state) => {
      setUploadState(state.isProcessing ? 'uploading' : state.files.some(f => f.status === 'error') ? 'error' : 'idle');
      setProgress(state.files.length ? state.files.reduce((avg, file) => avg + file.progress, 0) / state.files.length : 0);
      // No direct access to transcripts in the store
      setFileCount(state.files.length);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    uploadState,
    transcripts,
    progress,
    fileCount,
    startUpload,
    completeUpload,
    updateProgress,
    addTranscript,
    setFileCount: setFileCountAction,
  };
};
