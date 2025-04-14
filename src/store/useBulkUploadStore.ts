
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { BulkUploadFilter } from '@/types/teamTypes';

export type UploadState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export interface BulkUploadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  transcriptId?: string;
  assignedTo?: string;
}

export interface BulkUploadTranscript {
  id: string;
  filename?: string;
  text: string;
  created_at: string;
  duration?: number;
  sentiment?: string;
  keywords?: string[];
  status?: string;
}

export interface BulkUploadStore {
  files: BulkUploadFile[];
  isProcessing: boolean;
  uploadHistory: any[];
  hasLoadedHistory: boolean;
  progress: number;
  uploadState: UploadState;
  transcripts: BulkUploadTranscript[];
  fileCount: number;
  
  // Actions
  processQueue: () => void;
  addFiles: (files: BulkUploadFile[]) => void;
  refreshTranscripts: (filters?: BulkUploadFilter) => Promise<any[]>;
  setProgress: (id: string, progress: number, status?: BulkUploadFile['status'], transcriptId?: string, error?: string) => void;
  addTranscript: (transcript: Partial<BulkUploadTranscript>) => void;
  setFileCount: (count: number) => void;
  setUploadHistory: (history: any[]) => void;
  start: () => void;
  complete: () => void;
}

export const useBulkUploadStore = create<BulkUploadStore>((set, get) => ({
  files: [],
  isProcessing: false,
  uploadHistory: [],
  hasLoadedHistory: false,
  progress: 0,
  uploadState: 'idle',
  transcripts: [],
  fileCount: 0,
  
  processQueue: () => {
    set({ isProcessing: true });
  },
  
  addFiles: (files) => {
    set((state) => ({
      files: [...state.files, ...files],
    }));
  },
  
  refreshTranscripts: async (filters?: BulkUploadFilter) => {
    try {
      let query = supabase
        .from('call_transcripts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform data to transcripts
      const transcripts = data?.map(item => ({
        id: item.id,
        filename: item.filename,
        text: item.text,
        created_at: item.created_at,
        duration: item.duration,
        sentiment: item.sentiment,
        keywords: item.keywords,
        status: 'complete'
      })) || [];
      
      set({ transcripts, hasLoadedHistory: true });
      return transcripts;
    } catch (error) {
      console.error('Error refreshing transcripts:', error);
      return [];
    }
  },
  
  setProgress: (id, progress, status, transcriptId, error) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id
          ? {
              ...file,
              progress,
              status: status || file.status,
              transcriptId: transcriptId || file.transcriptId,
              error: error || file.error,
            }
          : file
      ),
      progress: state.files.reduce((sum, file) => sum + file.progress, progress) / (state.files.length + 1),
    }));
  },
  
  addTranscript: (transcript) => {
    const newTranscript: BulkUploadTranscript = {
      id: transcript.id || uuidv4(),
      filename: transcript.filename,
      text: transcript.text || '',
      created_at: transcript.created_at || new Date().toISOString(),
      duration: transcript.duration,
      sentiment: transcript.sentiment,
      keywords: transcript.keywords,
      status: transcript.status,
    };
    
    set((state) => ({
      transcripts: [newTranscript, ...state.transcripts],
    }));
  },
  
  setFileCount: (count) => {
    set({ fileCount: count });
  },
  
  setUploadHistory: (history) => {
    set({ uploadHistory: history, hasLoadedHistory: true });
  },
  
  start: () => {
    set({ uploadState: 'uploading', isProcessing: true });
  },
  
  complete: () => {
    set({ uploadState: 'complete', isProcessing: false });
  },
}));
