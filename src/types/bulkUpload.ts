
export interface BulkUploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'complete' | 'error' | 'pending';
  error?: string;
  transcriptId?: string;
}

export interface BulkUploadTranscript {
  id: string;
  filename: string;
  text: string;
  created_at: string;
  duration: number;
  sentiment: string;
  keywords: string[];
}

export interface BulkUploadFilter {
  force?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export type UploadState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
