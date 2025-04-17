
import { create } from 'zustand';
import { BulkUploadFilter, BulkUploadFile } from '@/types/bulkUpload';

export interface BulkUploadState {
  files: BulkUploadFile[];
  isUploading: boolean;
  isProcessing: boolean;
  currentlyProcessing: string | null;
  totalProgress: number;
  progress: number;
  uploadState: any;
  transcripts: any[];
  fileCount: number;
  
  // Methods
  start: () => void;
  complete: () => void;
  addFile: (file: File) => void;
  addFiles: (files: File[]) => void;
  updateFileStatus: (id: string, status: BulkUploadFile['status'], progress: number, result?: string, error?: string, transcriptId?: string) => void;
  setProgress: (fileId: string, progress: number, status: string, transcriptId?: string, error?: string) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setIsUploading: (isUploading: boolean) => void;
  setCurrentlyProcessing: (id: string | null) => void;
  removeCompletedFiles: () => void;
  assignFileToUser: (fileId: string, userId: string) => void;
  addTranscript: (transcript: any) => void;
  setFileCount: (count: number) => void;
  refreshTranscripts: (filter?: BulkUploadFilter) => Promise<void>;
}

export const useBulkUploadStore = create<BulkUploadState>((set, get) => ({
  files: [],
  isUploading: false,
  isProcessing: false,
  currentlyProcessing: null,
  totalProgress: 0,
  progress: 0,
  uploadState: null,
  transcripts: [],
  fileCount: 0,
  
  start: () => set({ isProcessing: true }),
  
  complete: () => set({ isProcessing: false }),
  
  addFile: (file) => set((state) => {
    const id = crypto.randomUUID();
    const newFile: BulkUploadFile = {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'queued'
    };
    
    return { 
      files: [...state.files, newFile] 
    };
  }),
  
  addFiles: (files) => set((state) => {
    const newFiles = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'queued' as const
    }));
    
    return { 
      files: [...state.files, ...newFiles] 
    };
  }),
  
  updateFileStatus: (id, status, progress, result, error, transcriptId) => 
    set((state) => {
      const newFiles = state.files.map(file => 
        file.id === id ? { 
          ...file, 
          status, 
          progress, 
          result: result || file.result,
          error: error || file.error,
          transcriptId: transcriptId || file.transcriptId
        } : file
      );
      
      // Calculate total progress across all files
      const totalProgress = newFiles.reduce((sum, file) => sum + file.progress, 0) / newFiles.length;
      
      return { 
        files: newFiles,
        totalProgress: Math.round(totalProgress)
      };
    }),
    
  setProgress: (fileId, progress, status, transcriptId, error) => {
    const { updateFileStatus } = get();
    updateFileStatus(fileId, status as BulkUploadFile['status'], progress, undefined, error, transcriptId);
  },
    
  removeFile: (id) => set((state) => ({
    files: state.files.filter(file => file.id !== id)
  })),
  
  clearFiles: () => set(() => ({
    files: [],
    totalProgress: 0
  })),
  
  setIsUploading: (isUploading) => set(() => ({ isUploading })),
  
  setCurrentlyProcessing: (id) => set(() => ({ currentlyProcessing: id })),
  
  removeCompletedFiles: () => set((state) => ({
    files: state.files.filter(file => file.status !== 'complete')
  })),
  
  assignFileToUser: (fileId, userId) => set((state) => ({
    files: state.files.map(file => 
      file.id === fileId ? { ...file, assignedTo: userId } : file
    )
  })),
  
  addTranscript: (transcript) => set((state) => ({
    transcripts: [...state.transcripts, transcript]
  })),
  
  setFileCount: (count) => set(() => ({ fileCount: count })),
  
  refreshTranscripts: async (filter) => {
    // This would normally be implemented to fetch transcripts
    // For now it's a placeholder
    return Promise.resolve();
  }
}));
