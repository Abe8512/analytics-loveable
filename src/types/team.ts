
export type BulkUploadState = 'idle' | 'uploading' | 'complete' | 'error';

export interface BulkUploadFilter {
  force?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
