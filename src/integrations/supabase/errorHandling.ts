import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export class SupabaseErrorHandler {
  /**
   * Handle Postgrest errors with better error messages and logging
   */
  static handlePostgrestError(
    error: PostgrestError,
    context: string = '',
    silent: boolean = false
  ): void {
    // Log the error with context
    console.error(`[Supabase Error] ${context}: ${error.message}`, error);
    
    // Generate a more user-friendly message based on error code
    let userMessage = 'Database operation failed';
    let description = error.message;
    
    switch (error.code) {
      case '23505': // unique_violation
        userMessage = 'Duplicate record found';
        description = 'A record with this information already exists.';
        break;
        
      case '42P01': // undefined_table
        userMessage = 'Database configuration issue';
        description = 'A required table is missing. Please contact support.';
        break;
        
      case '42703': // undefined_column
        userMessage = 'Database configuration issue';
        description = 'A required column is missing. Please contact support.';
        break;
        
      case '22P02': // invalid_text_representation
        userMessage = 'Invalid data format';
        description = 'The data provided is in an invalid format.';
        break;
        
      case '23503': // foreign_key_violation
        userMessage = 'Reference error';
        description = 'This record references data that does not exist.';
        break;
        
      case '28000': // invalid_authorization_specification
        userMessage = 'Authorization failed';
        description = 'Your session may have expired. Please refresh the page.';
        break;
        
      case '3D000': // invalid_catalog_name
        userMessage = 'Database connection error';
        description = 'Unable to connect to the database. Please try again.';
        break;
        
      case '28P01': // invalid_password
        userMessage = 'Authentication failed';
        description = 'Database authentication error. Please contact support.';
        break;
        
      case '42P10': // invalid_on_conflict
        userMessage = 'Database error';
        description = 'ON CONFLICT specification error. Using fallback method to save data.';
        break;
        
      default:
        // For unknown errors, use the original message
        userMessage = 'Database error';
    }
    
    // Show toast if not silent
    if (!silent) {
      toast.error(userMessage, {
        description,
        duration: 5000
      });
    }
  }
  
  /**
   * Handle storage errors
   */
  static handleStorageError(
    error: Error,
    context: string = '',
    silent: boolean = false
  ): void {
    console.error(`[Storage Error] ${context}: ${error.message}`, error);
    
    if (!silent) {
      toast.error('Storage operation failed', {
        description: error.message,
        duration: 5000
      });
    }
  }
  
  /**
   * Handle auth errors
   */
  static handleAuthError(
    error: Error,
    context: string = '',
    silent: boolean = false
  ): void {
    console.error(`[Auth Error] ${context}: ${error.message}`, error);
    
    // Look for common auth error messages
    let userMessage = 'Authentication failed';
    let description = error.message;
    
    if (error.message.includes('Email not confirmed')) {
      userMessage = 'Email not verified';
      description = 'Please check your email to verify your account.';
    } else if (error.message.includes('Invalid login credentials')) {
      userMessage = 'Invalid credentials';
      description = 'Please check your email and password.';
    } else if (error.message.includes('User already registered')) {
      userMessage = 'Account already exists';
      description = 'An account with this email already exists.';
    } else if (error.message.includes('Password should be at least')) {
      userMessage = 'Password too weak';
      description = error.message;
    } else if (error.message.includes('JWT expired')) {
      userMessage = 'Session expired';
      description = 'Please sign in again.';
    }
    
    if (!silent) {
      toast.error(userMessage, {
        description,
        duration: 5000
      });
    }
  }
}

/**
 * Safely execute a supabase operation with proper error handling
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T; error: any }>,
  context: string = '',
  options: {
    silent?: boolean;
    defaultValue?: T;
  } = {}
): Promise<T | undefined> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      if (error.code) {
        // PostgrestError
        SupabaseErrorHandler.handlePostgrestError(
          error, 
          context, 
          options.silent
        );
      } else {
        // Generic error
        console.error(`[Supabase Operation Error] ${context}:`, error);
        
        if (!options.silent) {
          toast.error('Operation failed', {
            description: error.message || 'An unexpected error occurred',
            duration: 5000
          });
        }
      }
      
      return options.defaultValue;
    }
    
    return data;
  } catch (err) {
    console.error(`[Supabase Unexpected Error] ${context}:`, err);
    
    if (!options.silent) {
      toast.error('Unexpected error', {
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        duration: 5000
      });
    }
    
    return options.defaultValue;
  }
}
