
import { create } from 'zustand';
import { BulkUploadFile, BulkUploadStore } from '@/services/BulkUploadService';
import { BulkUploadFilter } from '@/types/teamTypes';

export const useBulkUploadStore = create<BulkUploadStore>((set, get) => ({
  files: [],
  isProcessing: false,
  uploadHistory: [],
  hasLoadedHistory: false,
  
  // Lock management
  acquireProcessingLock: () => {
    if (get().isProcessing) return false;
    set({ isProcessing: true });
    return true;
  },
  
  releaseProcessingLock: () => {
    set({ isProcessing: false });
  },
  
  setProcessing: (processing) => {
    set({ isProcessing: processing });
  },
  
  // File management
  addFiles: (newFiles) => {
    const files = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending' as const,
      progress: 0
    }));
    
    set(state => ({
      files: [...state.files, ...files]
    }));
  },
  
  // History management
  loadUploadHistory: async () => {
    // Mock implementation
    const mockHistory = [
      {
        id: crypto.randomUUID(),
        filename: 'Sales Call 1',
        text: 'This is a sample transcript from a sales call.',
        created_at: new Date().toISOString(),
        duration: 360,
        sentiment: 'positive',
        keywords: ['pricing', 'feature', 'demo']
      },
      {
        id: crypto.randomUUID(),
        filename: 'Customer Support',
        text: 'This is a sample transcript from a customer support call.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        duration: 480,
        sentiment: 'neutral',
        keywords: ['issue', 'resolution', 'feedback']
      }
    ];
    
    set({ 
      uploadHistory: mockHistory,
      hasLoadedHistory: true 
    });
    
    return mockHistory;
  },
  
  refreshTranscripts: async (filters) => {
    return get().loadUploadHistory();
  },
  
  // Additional methods for BulkUploadHooks compatibility
  start: () => {},
  complete: () => {},
  setProgress: () => {},
  addTranscript: () => {},
  setFileCount: () => {},
  setAssignedUserId: () => {}
}));
