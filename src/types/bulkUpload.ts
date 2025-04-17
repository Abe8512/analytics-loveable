
/**
 * Interface for bulk upload filter options
 */
export interface BulkUploadFilter {
  force?: boolean;
  includeProcessed?: boolean;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Interface for bulk upload file
 */
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

export interface BulkUploadHistoryItem {
  id: string;
  filename: string;
  created_at: string;
  duration?: number;
  sentiment?: string;
  keywords?: string[];
  text: string;
}
