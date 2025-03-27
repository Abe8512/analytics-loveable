import { supabase } from '@/integrations/supabase/client';

interface ConnectionResult {
  connected: boolean;
  timestamp: string;
  version?: string;
  error?: string;
}

interface TableResult {
  name: string;
  exists: boolean;
  required: boolean;
  rowCount: number;
  error?: string;
}

export class DatabaseDiagnosticService {
  private supabase = supabase;
  
  constructor() {}
  
  checkConnection = async (): Promise<ConnectionResult> => {
  try {
    const { data, error } = await this.supabase.rpc('check_connection');
    
    if (error) {
      return { 
        connected: false, 
        error: error.message,
        timestamp: new Date().toISOString() 
      };
    }
    
    // Handle response data safely
    let connected = false;
    let timestamp = new Date().toISOString();
    let version = '';
    
    if (data && typeof data === 'object') {
      connected = data.connected === true;
      timestamp = data.timestamp || timestamp;
      version = data.version || '';
    }
    
    return { 
      connected,
      timestamp,
      version
    };
  } catch (err) {
    return { 
      connected: false, 
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
};

  
  validateFixes = async (): Promise<{success: boolean, results: Record<string, boolean>}> => {
  try {
    const { data, error } = await this.supabase.rpc('validate_database_fixes');
    
    if (error) {
      throw new Error(`Error validating fixes: ${error.message}`);
    }
    
    // Safe handling of the response
    let results: Record<string, boolean> = {};
    let success = false;
    
    if (data && typeof data === 'object') {
      // Extract boolean values safely
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          results[key] = value;
        }
      });
      
      // Check if all_fixes_applied is true
      success = (data.all_fixes_applied === true);
    }
    
    return { success, results };
  } catch (err) {
    console.error('Error validating fixes:', err);
    return { 
      success: false, 
      results: { error: false } 
    };
  }
};

  
  checkTables = async (): Promise<TableResult[]> => {
  try {
    const tables = [
      { name: 'call_transcripts', required: true },
      { name: 'calls', required: true },
      { name: 'keyword_trends', required: false },
      { name: 'sentiment_trends', required: false },
      { name: 'schema_migrations', required: false },
      { name: 'team_members', required: false }
    ];
    
    const results: TableResult[] = [];
    
    for (const table of tables) {
      try {
        // Use the any type assertion to avoid TypeScript errors
        const { count, error } = await this.supabase
          .from(table.name as any)
          .select('*', { count: 'exact', head: true });
        
        results.push({
          name: table.name,
          exists: !error,
          required: table.required,
          rowCount: count || 0,
          error: error ? error.message : undefined
        });
      } catch (tableError) {
        results.push({
          name: table.name,
          exists: false,
          required: table.required,
          rowCount: 0,
          error: tableError instanceof Error ? tableError.message : 'Unknown error checking table'
        });
      }
    }
    
    return results;
  } catch (err) {
    console.error('Error checking tables:', err);
    return [];
  }
};
}

export const databaseDiagnosticService = new DatabaseDiagnosticService();
