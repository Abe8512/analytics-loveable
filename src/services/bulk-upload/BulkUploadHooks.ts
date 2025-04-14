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

  // Wrap Zustand actions
  const start = useBulkUploadStore((state) => state.start);
  const complete = useBulkUploadStore((state) => state.complete);
  const setZProgress = useBulkUploadStore((state) => state.setProgress);
  const addZTranscript = useBulkUploadStore((state) => state.addTranscript);
  const setZFileCount = useBulkUploadStore((state) => state.setFileCount);

  // Local actions
  const startUpload = () => {
    setUploadState('uploading');
    start();
    EventsStore.dispatchEvent('bulk-upload-started' as EventType);
  };

  const completeUpload = () => {
    setUploadState('complete');
    complete();
    EventsStore.dispatchEvent('bulk-upload-completed' as EventType, { data: { fileCount } });
  };

  const updateProgress = (progress: number) => {
    setProgress(progress);
    setZProgress(progress);
    EventsStore.dispatchEvent('bulk-upload-progress' as EventType, { data: { progress } });
  };

  const addTranscript = (transcript: CallTranscript) => {
    setTranscripts((prev) => [...prev, transcript]);
    addZTranscript(transcript);
  };

  const setFileCountAction = (count: number) => {
    setFileCount(count);
    setZFileCount(count);
  };

  // Subscribe to Zustand state changes
  useEffect(() => {
    useBulkUploadStore.subscribe((state) => {
      setUploadState(state.uploadState);
      setProgress(state.progress);
      setTranscripts(state.transcripts);
      setFileCount(state.fileCount);
    });
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
