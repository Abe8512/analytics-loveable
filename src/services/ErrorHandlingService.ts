
// Define standardized error types for the application
export type AppErrorType = 
  | 'database'
  | 'network'
  | 'auth'
  | 'api'
  | 'transcription'
  | 'processing'
  | 'unknown';

export interface AppError {
  type: AppErrorType;
  message: string;
  originalError?: any;
  timestamp: Date;
  context?: string;
}

class ErrorHandler {
  private errors: AppError[] = [];
  private maxErrorsStored = 50;
  private errorListeners: ((error: AppError) => void)[] = [];
  public networkLatency = 0;
  
  handleError(error: any, context?: string): AppError {
    const appError = this.createAppError(error, context);
    
    // Add to error history, maintaining max size
    this.errors.unshift(appError);
    if (this.errors.length > this.maxErrorsStored) {
      this.errors = this.errors.slice(0, this.maxErrorsStored);
    }
    
    // Log to console with standardized format
    console.error(`[${appError.type}] ${appError.message}`, {
      context: appError.context,
      timestamp: appError.timestamp,
      originalError: appError.originalError
    });
    
    // Notify listeners
    this.notifyListeners(appError);
    
    return appError;
  }
  
  private createAppError(error: any, context?: string): AppError {
    const errorMessage = error?.message || 'An unknown error occurred';
    
    // Determine error type based on message or error instance
    let errorType: AppErrorType = 'unknown';
    
    if (error?.code === 'PGRST301' || error?.message?.includes('database')) {
      errorType = 'database';
    } else if (error?.message?.includes('network') || error instanceof TypeError && error.message.includes('fetch')) {
      errorType = 'network';
    } else if (error?.message?.includes('auth') || error?.code === 'auth/') {
      errorType = 'auth';
    } else if (error?.message?.includes('API') || error?.status === 429) {
      errorType = 'api';
    } else if (error?.message?.includes('transcription') || error?.message?.includes('Whisper')) {
      errorType = 'transcription';
    } else if (error?.message?.includes('processing')) {
      errorType = 'processing';
    }
    
    return {
      type: errorType,
      message: errorMessage,
      originalError: error,
      timestamp: new Date(),
      context
    };
  }
  
  getRecentErrors(): AppError[] {
    return [...this.errors];
  }
  
  clearErrors(): void {
    this.errors = [];
  }
  
  addErrorListener(listener: (error: AppError) => void): () => void {
    this.errorListeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }
  
  setNetworkLatency(latency: number): void {
    this.networkLatency = latency;
  }
  
  getErrorSummary(): { byType: Record<AppErrorType, number>, total: number } {
    const byType: Record<AppErrorType, number> = {
      database: 0,
      network: 0,
      auth: 0,
      api: 0,
      transcription: 0,
      processing: 0,
      unknown: 0
    };
    
    this.errors.forEach(error => {
      byType[error.type]++;
    });
    
    return {
      byType,
      total: this.errors.length
    };
  }
}

// Create a singleton instance
export const errorHandler = new ErrorHandler();
