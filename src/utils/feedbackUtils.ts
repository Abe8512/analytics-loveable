
import { toast } from 'sonner';

interface FeedbackOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  duration?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Wraps an async operation with loading, success, and error toasts
 */
export async function withFeedback<T>(
  operation: () => Promise<T>,
  options: FeedbackOptions
): Promise<T | undefined> {
  const {
    loadingMessage = 'Processing...',
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred',
    duration = 3000,
    onSuccess,
    onError
  } = options;
  
  let toastId: string | number | undefined;
  
  try {
    // Show loading toast
    if (loadingMessage) {
      toastId = toast.loading(loadingMessage);
    }
    
    // Perform the operation
    const result = await operation();
    
    // Dismiss loading toast and show success
    if (toastId) toast.dismiss(toastId);
    if (successMessage) toast.success(successMessage, { duration });
    
    if (onSuccess) onSuccess();
    
    return result;
  } catch (error) {
    // Dismiss loading toast and show error
    if (toastId) toast.dismiss(toastId);
    
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMsg = errorObj.message || errorMessage;
    
    toast.error(errorMessage, { 
      description: errorMsg,
      duration
    });
    
    if (onError) onError(errorObj);
    console.error('Operation failed:', errorObj);
    
    return undefined;
  }
}

/**
 * Creates toast notifications for data synchronization operations
 */
export const syncFeedback = {
  started: (entity: string) => {
    toast.info(`Synchronizing ${entity}...`, {
      duration: 2000,
    });
  },
  
  success: (entity: string, count?: number) => {
    toast.success(`${entity} synchronized successfully`, {
      description: count !== undefined ? `${count} items updated` : undefined,
      duration: 3000,
    });
  },
  
  error: (entity: string, error?: string) => {
    toast.error(`Failed to synchronize ${entity}`, {
      description: error || 'Please try again later',
      duration: 5000,
    });
  },
  
  noChanges: (entity: string) => {
    toast.info(`No changes to ${entity}`, {
      description: 'All data is up to date',
      duration: 2000,
    });
  }
};
