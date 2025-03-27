
import { supabase } from './client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { safeSupabaseOperation, SupabaseErrorHandler } from './errorHandling';
import { toast } from 'sonner';

/**
 * Check if a table exists in the database
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) {
      SupabaseErrorHandler.handlePostgrestError(error, `checkTableExists(${tableName})`, true);
      return false;
    }
    
    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    console.error(`Error checking if table ${tableName} exists:`, err);
    return false;
  }
}

/**
 * Check if a column exists in a table
 */
export async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
    
    if (error) {
      SupabaseErrorHandler.handlePostgrestError(error, `checkColumnExists(${tableName}, ${columnName})`, true);
      return false;
    }
    
    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, err);
    return false;
  }
}

/**
 * Safely fetch data from a table with proper error handling
 */
export async function fetchData<T>(
  tableName: string,
  options?: {
    columns?: string,
    filter?: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>,
    limit?: number,
    order?: { column: string, ascending?: boolean },
    silent?: boolean
  }
): Promise<T[]> {
  // Check if table exists first to prevent unnecessary errors
  const tableExists = await checkTableExists(tableName);
  if (!tableExists) {
    if (!options?.silent) {
      toast.error('Database Error', {
        description: `The table "${tableName}" does not exist.`,
        duration: 5000,
      });
    }
    return [];
  }
  
  try {
    // Start building the query
    let query = supabase
      .from(tableName)
      .select(options?.columns || '*');
    
    // Apply filter if provided
    if (options?.filter) {
      query = options.filter(query);
    }
    
    // Apply order if provided
    if (options?.order) {
      query = query.order(
        options.order.column,
        { ascending: options.order.ascending ?? true }
      );
    }
    
    // Apply limit if provided
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      SupabaseErrorHandler.handlePostgrestError(
        error, 
        `fetchData(${tableName})`, 
        options?.silent
      );
      return [];
    }
    
    return (data || []) as T[];
  } catch (err) {
    console.error(`Error fetching data from ${tableName}:`, err);
    
    if (!options?.silent) {
      toast.error('Unexpected Error', {
        description: 'An unexpected error occurred while fetching data. Please try again.',
        duration: 5000,
      });
    }
    
    return [];
  }
}

/**
 * Safely insert data into a table with proper error handling
 */
export async function insertData<T>(
  tableName: string,
  data: Record<string, any> | Record<string, any>[],
  options?: {
    onConflict?: string,
    returning?: string,
    silent?: boolean
  }
): Promise<T[]> {
  return safeSupabaseOperation<T[]>(
    async () => {
      let query = supabase
        .from(tableName)
        .insert(data);
      
      if (options?.onConflict) {
        query = query.onConflict(options.onConflict);
      }
      
      if (options?.returning) {
        query = query.select(options.returning);
      }
      
      return await query;
    },
    `insertData(${tableName})`,
    { 
      silent: options?.silent,
      defaultValue: [] 
    }
  ) || [];
}

/**
 * Safely update data in a table with proper error handling
 */
export async function updateData<T>(
  tableName: string,
  data: Record<string, any>,
  filter: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>,
  options?: {
    returning?: string,
    silent?: boolean
  }
): Promise<T[]> {
  return safeSupabaseOperation<T[]>(
    async () => {
      let query = supabase
        .from(tableName)
        .update(data);
      
      // Apply the filter
      query = filter(query);
      
      if (options?.returning) {
        query = query.select(options.returning);
      }
      
      return await query;
    },
    `updateData(${tableName})`,
    { 
      silent: options?.silent,
      defaultValue: [] 
    }
  ) || [];
}

/**
 * Safely delete data from a table with proper error handling
 */
export async function deleteData<T>(
  tableName: string,
  filter: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>,
  options?: {
    returning?: string,
    silent?: boolean
  }
): Promise<T[]> {
  return safeSupabaseOperation<T[]>(
    async () => {
      let query = supabase
        .from(tableName)
        .delete();
      
      // Apply the filter
      query = filter(query);
      
      if (options?.returning) {
        query = query.select(options.returning);
      }
      
      return await query;
    },
    `deleteData(${tableName})`,
    { 
      silent: options?.silent,
      defaultValue: [] 
    }
  ) || [];
}
