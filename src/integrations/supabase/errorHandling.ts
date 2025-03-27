
import { PostgrestError, AuthError } from '@supabase/supabase-js';
import { toast } from "sonner";

/**
 * Standardized error handling for Supabase operations
 */
export class SupabaseErrorHandler {
  /**
   * Handle Postgrest errors from database operations
   */
  static handlePostgrestError(
    error: PostgrestError | null | undefined, 
    context: string,
    silent: boolean = false
  ): string {
    if (!error) return '';
    
    const { code, message, details, hint } = error;
    
    // Log the error for debugging
    console.error(`Supabase error in ${context}:`, { code, message, details, hint });
    
    // Determine user-friendly message based on error code
    let userMessage = 'An error occurred while accessing the database.';
    
    if (code === '23505') {
      userMessage = 'This record already exists.';
    } else if (code === '42P01') {
      userMessage = 'The requested data table does not exist.';
    } else if (code === '42703') {
      userMessage = 'Invalid field requested.';
    } else if (code?.startsWith('23')) {
      userMessage = 'Data validation error.';
    } else if (code?.startsWith('28')) {
      userMessage = 'Authorization error. You may not have permission for this action.';
    } else if (code?.startsWith('42')) {
      userMessage = 'Database structure error.';
    } else if (message) {
      userMessage = message;
    }
    
    // Show toast if not silent
    if (!silent) {
      toast.error('Database Error', {
        description: userMessage,
        duration: 5000,
      });
    }
    
    return userMessage;
  }
  
  /**
   * Handle authentication errors
   */
  static handleAuthError(
    error: AuthError | Error | null | undefined, 
    context: string,
    silent: boolean = false
  ): string {
    if (!error) return '';
    
    console.error(`Auth error in ${context}:`, error);
    
    let userMessage = 'An authentication error occurred.';
    
    if ('code' in error) {
      // Handle Supabase auth errors
      const { message } = error;
      
      if (error.code === 'invalid_credentials') {
        userMessage = 'Invalid email or password.';
      } else if (error.code === 'user_not_found') {
        userMessage = 'No user found with this email address.';
      } else if (error.code === 'email_not_confirmed') {
        userMessage = 'Please confirm your email address before signing in.';
      } else if (message) {
        userMessage = message;
      }
    } else if (error.message) {
      userMessage = error.message;
    }
    
    // Show toast if not silent
    if (!silent) {
      toast.error('Authentication Error', {
        description: userMessage,
        duration: 5000,
      });
    }
    
    return userMessage;
  }
  
  /**
   * Handle storage errors
   */
  static handleStorageError(
    error: Error | null | undefined, 
    context: string,
    silent: boolean = false
  ): string {
    if (!error) return '';
    
    console.error(`Storage error in ${context}:`, error);
    
    const userMessage = error.message || 'An error occurred while accessing storage.';
    
    // Show toast if not silent
    if (!silent) {
      toast.error('Storage Error', {
        description: userMessage,
        duration: 5000,
      });
    }
    
    return userMessage;
  }
}

/**
 * Wrapper for Supabase operations with standardized error handling
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null, error: PostgrestError | null }>,
  context: string,
  options?: { 
    silent?: boolean,
    defaultValue?: T | null,
    onError?: (error: PostgrestError) => void
  }
): Promise<T | null> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      SupabaseErrorHandler.handlePostgrestError(error, context, options?.silent);
      if (options?.onError) {
        options.onError(error);
      }
      return options?.defaultValue ?? null;
    }
    
    return data;
  } catch (err) {
    console.error(`Unexpected error in ${context}:`, err);
    
    if (!options?.silent) {
      toast.error('Unexpected Error', {
        description: 'An unexpected error occurred. Please try again.',
        duration: 5000,
      });
    }
    
    return options?.defaultValue ?? null;
  }
}
