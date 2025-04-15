
export interface BulkUploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  progress: number;
  result?: string;
  error?: string;
  transcriptId?: string;
  assignedTo?: string;
}

export type BulkUploadStatus = 'idle' | 'uploading' | 'complete' | 'error';

export interface BulkUploadFilter {
  force?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface BulkUploadHistoryItem {
  id: string;
  filename: string;
  created_at: string;
  duration?: number;
  sentiment?: string;
  keywords?: string[];
  text: string;
}
