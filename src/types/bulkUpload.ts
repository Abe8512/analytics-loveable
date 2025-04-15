
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
