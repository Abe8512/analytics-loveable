
export type BulkUploadState = 'idle' | 'uploading' | 'complete' | 'error';

export interface BulkUploadFilter {
  force?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TeamPerformanceMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  performance: 'good' | 'average' | 'poor';
}
