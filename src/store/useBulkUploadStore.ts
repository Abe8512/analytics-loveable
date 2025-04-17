
import { create } from 'zustand';
import { BulkUploadFilter } from '@/types/teamTypes';

interface BulkUploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'queued' | 'processing' | 'complete' | 'error';
  error?: string;
  transcriptId?: string;
  result?: string;
  assignedTo?: string;
}

interface BulkUploadState {
  files: BulkUploadFile[];
  isUploading: boolean;
  currentlyProcessing: string | null;
  totalProgress: number;
  addFile: (file: File) => void;
  addFiles: (files: File[]) => void;
  updateFileStatus: (id: string, status: BulkUploadFile['status'], progress: number, result?: string, error?: string, transcriptId?: string) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setIsUploading: (isUploading: boolean) => void;
  setCurrentlyProcessing: (id: string | null) => void;
  removeCompletedFiles: () => void;
  assignFileToUser: (fileId: string, userId: string) => void;
}

export const useBulkUploadStore = create<BulkUploadState>((set) => ({
  files: [],
  isUploading: false,
  currentlyProcessing: null,
  totalProgress: 0,
  
  addFile: (file) => set((state) => {
    const id = crypto.randomUUID();
    const newFile: BulkUploadFile = {
      id,
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
  }))
}));
