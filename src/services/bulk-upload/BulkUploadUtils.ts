
import { CallTranscript } from '@/types/call';

// Utility functions for bulk uploads
export const parseTranscript = (text: string): CallTranscript => {
  // Basic implementation to satisfy the interface
  return {
    id: crypto.randomUUID(),
    text: text,
    created_at: new Date().toISOString(),
    duration: 0,
    sentiment: 'neutral',
    keywords: []
  };
};

export const formatUploadProgress = (progress: number): string => {
  return `${Math.round(progress)}%`;
};

export const getBulkUploadError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Unknown error occurred during upload';
};
