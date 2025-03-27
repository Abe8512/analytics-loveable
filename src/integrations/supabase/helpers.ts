
import { supabase } from './client';
import { safeSupabaseOperation, SupabaseErrorHandler } from './errorHandling';
import { toast } from 'sonner';

/**
 * Check if a table exists in the database using raw SQL instead of information_schema
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc(
      'check_table_exists',
      { table_name: tableName }
    );
    
    if (error) {
      SupabaseErrorHandler.handlePostgrestError(error, `checkTableExists(${tableName})`, true);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error(`Error checking if table ${tableName} exists:`, err);
    return false;
  }
}

/**
 * Check if a column exists in a table using RPC instead of direct schema access
 */
export async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc(
      'check_column_exists',
      { 
        p_table_name: tableName,
        p_column_name: columnName
      }
    );
    
    if (error) {
      SupabaseErrorHandler.handlePostgrestError(error, `checkColumnExists(${tableName}, ${columnName})`, true);
      return false;
    }
    
    return !!data;
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
    filter?: (query: any) => any,
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
    // Start building the query - we need to use type assertions here
    // to work around TypeScript's strict typing of Supabase tables
    let query = supabase
      .from(tableName as any)
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
 * Using RPC to avoid type issues
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
  // Create a custom RPC function to handle this safely
  try {
    const { data: result, error } = await supabase.rpc(
      'execute_sql_with_results',
      { 
        query_text: `
          INSERT INTO ${tableName} 
          SELECT * FROM jsonb_populate_recordset(null::${tableName}, $1)
          ${options?.onConflict ? ` ON CONFLICT (${options.onConflict}) DO UPDATE SET ` : ''}
          ${options?.returning ? ` RETURNING ${options.returning}` : ''}
        `,
        params: JSON.stringify(Array.isArray(data) ? data : [data])
      }
    );
    
    if (error) {
      if (!options?.silent) {
        toast.error('Error inserting data', {
          description: error.message,
          duration: 5000
        });
      }
      console.error(`Error inserting data into ${tableName}:`, error);
      return [];
    }
    
    return (result || []) as T[];
  } catch (err) {
    if (!options?.silent) {
      toast.error('Unexpected error', {
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        duration: 5000
      });
    }
    console.error(`Error inserting data into ${tableName}:`, err);
    return [];
  }
}

/**
 * Safely update data in a table with proper error handling
 * Using RPC to avoid type issues
 */
export async function updateData<T>(
  tableName: string,
  data: Record<string, any>,
  whereClause: string,
  options?: {
    returning?: string,
    silent?: boolean
  }
): Promise<T[]> {
  try {
    // Build update statement fields
    const updateFields = Object.entries(data)
      .map(([key, value]) => `${key} = '${typeof value === 'object' ? JSON.stringify(value) : value}'`)
      .join(', ');
    
    const { data: result, error } = await supabase.rpc(
      'execute_sql_with_results',
      { 
        query_text: `
          UPDATE ${tableName}
          SET ${updateFields}
          WHERE ${whereClause}
          ${options?.returning ? ` RETURNING ${options.returning}` : ''}
        `
      }
    );
    
    if (error) {
      if (!options?.silent) {
        toast.error('Error updating data', {
          description: error.message,
          duration: 5000
        });
      }
      console.error(`Error updating data in ${tableName}:`, error);
      return [];
    }
    
    return (result || []) as T[];
  } catch (err) {
    if (!options?.silent) {
      toast.error('Unexpected error', {
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        duration: 5000
      });
    }
    console.error(`Error updating data in ${tableName}:`, err);
    return [];
  }
}

/**
 * Safely delete data from a table with proper error handling
 * Using RPC to avoid type issues
 */
export async function deleteData<T>(
  tableName: string,
  whereClause: string,
  options?: {
    returning?: string,
    silent?: boolean
  }
): Promise<T[]> {
  try {
    const { data: result, error } = await supabase.rpc(
      'execute_sql_with_results',
      { 
        query_text: `
          DELETE FROM ${tableName}
          WHERE ${whereClause}
          ${options?.returning ? ` RETURNING ${options.returning}` : ''}
        `
      }
    );
    
    if (error) {
      if (!options?.silent) {
        toast.error('Error deleting data', {
          description: error.message,
          duration: 5000
        });
      }
      console.error(`Error deleting data from ${tableName}:`, error);
      return [];
    }
    
    return (result || []) as T[];
  } catch (err) {
    if (!options?.silent) {
      toast.error('Unexpected error', {
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        duration: 5000
      });
    }
    console.error(`Error deleting data from ${tableName}:`, err);
    return [];
  }
}
