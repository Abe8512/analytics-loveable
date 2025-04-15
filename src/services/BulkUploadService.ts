import { v4 as uuidv4 } from 'uuid';

export type BulkUploadStatus = 'queued' | 'uploading' | 'processing' | 'complete' | 'error';

export interface BulkUploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: BulkUploadStatus;
  progress: number;
  error?: string;
  result?: any;
  createdAt: number | string;
}

type Listener = () => void;

export class BulkUploadServiceClass {
  private files: BulkUploadFile[] = [];
  private listeners: Listener[] = [];
  private currentUpload: { abort: () => void } | null = null;

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const storedFiles = localStorage.getItem('bulkUploadFiles');
    if (storedFiles) {
      this.files = JSON.parse(storedFiles);
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('bulkUploadFiles', JSON.stringify(this.files));
  }

  addFile(file: File): BulkUploadFile {
    const newFile: BulkUploadFile = {
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'queued',
      progress: 0,
      createdAt: Date.now(),
    };
    this.files.push(newFile);
    this.saveToLocalStorage();
    this.emitUpdate();
    return newFile;
  }

  getFile(fileId: string): BulkUploadFile | undefined {
    return this.files.find(file => file.id === fileId);
  }

  getFiles(): BulkUploadFile[] {
    return this.files;
  }

  removeFile(fileId: string): boolean {
    this.files = this.files.filter(file => file.id !== fileId);
    this.saveToLocalStorage();
    this.emitUpdate();
    return true;
  }

  clearAllFiles(): void {
    this.files = [];
    localStorage.removeItem('bulkUploadFiles');
    this.emitUpdate();
  }

  updateProgress(fileId: string, progress: number) {
    const fileIndex = this.files.findIndex(file => file.id === fileId);
    if (fileIndex === -1) return false;

    this.files[fileIndex] = {
      ...this.files[fileIndex],
      progress: progress
    };
    this.saveToLocalStorage();
    this.emitUpdate();
    return true;
  }

  updateStatus(fileId: string, newStatus: BulkUploadStatus) {
    const fileIndex = this.files.findIndex(file => file.id === fileId);
    if (fileIndex === -1) return false;
    
    const file = this.files[fileIndex];
    
    // Fix error here - ensure status comparison is type-safe
    if (file.status === 'complete' && newStatus !== 'error') {
      console.log(`File ${fileId} already complete, not changing status to ${newStatus}`);
      return false;
    }
    
    this.files[fileIndex] = {
      ...file,
      status: newStatus
    };
    
    this.emitUpdate();
    return true;
  }

  updateResult(fileId: string, result: any, error?: string) {
    const fileIndex = this.files.findIndex(file => file.id === fileId);
    if (fileIndex === -1) return false;

    this.files[fileIndex] = {
      ...this.files[fileIndex],
      status: error ? 'error' : 'complete',
      result: result,
      error: error
    };
    this.saveToLocalStorage();
    this.emitUpdate();
    return true;
  }

  async uploadFile(file: File, options: { onProgress?: (progress: number) => void } = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileId = this.addFile(file).id;
      this.updateStatus(fileId, 'uploading');

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      this.currentUpload = xhr;

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          this.updateProgress(fileId, progress);
          options.onProgress?.(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            this.updateStatus(fileId, 'processing');
            this.processUploadedFile(fileId, result)
              .then(processedResult => {
                this.updateResult(fileId, processedResult);
                resolve(processedResult);
              })
              .catch(processError => {
                this.updateResult(fileId, null, processError.message || 'Processing failed');
                reject(processError);
              });
          } catch (e) {
            this.updateResult(fileId, null, 'Invalid JSON response');
            reject(e);
          }
        } else {
          this.updateResult(fileId, null, `Upload failed with status ${xhr.status}`);
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        this.updateStatus(fileId, 'error');
        this.updateResult(fileId, null, 'Network error during upload');
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener("abort", () => {
        this.updateStatus(fileId, 'queued');
        this.updateResult(fileId, null, 'Upload aborted');
        reject(new Error('Upload aborted'));
      });

      xhr.open("POST", "/api/upload", true);
      xhr.send(formData);
    });
  }

  cancelUpload(): void {
    if (this.currentUpload) {
      this.currentUpload.abort();
      this.currentUpload = null;
    }
  }

  private async processUploadedFile(fileId: string, uploadResult: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (Math.random() > 0.2) {
      return {
        message: `File ${fileId} processed successfully`,
        details: uploadResult
      };
    } else {
      throw new Error('Simulated error during file processing');
    }
  }

  addListener(listener: Listener) {
    this.listeners.push(listener);
  }

  removeListener(listenerToRemove: Listener) {
    this.listeners = this.listeners.filter(listener => listener !== listenerToRemove);
  }

  private emitUpdate() {
    this.saveToLocalStorage();
    this.listeners.forEach(listener => listener());
  }
}

export const BulkUploadService = new BulkUploadServiceClass();
