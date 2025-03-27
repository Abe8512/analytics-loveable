
import { supabase } from '@/integrations/supabase/client';

interface DatabaseDiagnosticResult {
  connected: boolean;
  timestamp?: string;
  version?: string;
  tables?: string[];
  errors?: string[];
  fixesApplied?: boolean;
}

export class DatabaseDiagnosticService {
  /**
   * Run diagnostics on the database connection
   */
  public async runDiagnostic(): Promise<DatabaseDiagnosticResult> {
    try {
      // Check basic connection
      const connectionResult = await this.checkConnection();
      
      if (!connectionResult.connected) {
        return {
          connected: false,
          errors: ['Could not connect to database']
        };
      }
      
      // Get list of tables
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');
      
      if (tablesError) {
        return {
          ...connectionResult,
          errors: [`Error fetching tables: ${tablesError.message}`]
        };
      }
      
      // Check if database fixes have been applied
      const fixesResult = await this.checkDatabaseFixes();
      
      return {
        ...connectionResult,
        tables: tables?.map(t => t.table_name) || [],
        fixesApplied: fixesResult.fixesApplied,
        errors: fixesResult.errors
      };
    } catch (error) {
      console.error('Error running database diagnostic:', error);
      return {
        connected: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }
  
  /**
   * Format diagnostic results for display
   */
  public formatResults(results: DatabaseDiagnosticResult): string {
    let output = '';
    
    output += `Connection: ${results.connected ? '✅' : '❌'}\n`;
    if (results.timestamp) {
      output += `Timestamp: ${results.timestamp}\n`;
    }
    if (results.version) {
      output += `Version: ${results.version}\n`;
    }
    
    if (results.tables && results.tables.length > 0) {
      output += `\nTables (${results.tables.length}):\n`;
      output += results.tables.map(t => `- ${t}`).join('\n');
    }
    
    if (results.fixesApplied !== undefined) {
      output += `\n\nDatabase Fixes: ${results.fixesApplied ? '✅ Applied' : '❌ Not Applied'}\n`;
    }
    
    if (results.errors && results.errors.length > 0) {
      output += `\nErrors:\n`;
      output += results.errors.map(e => `- ${e}`).join('\n');
    }
    
    return output;
  }
  
  /**
   * Check basic database connection
   */
  private async checkConnection(): Promise<DatabaseDiagnosticResult> {
    try {
      const { data, error } = await supabase
        .rpc('check_connection');
      
      if (error) {
        return {
          connected: false,
          errors: [error.message]
        };
      }
      
      // Handle response based on whether it's an object or array
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return {
          connected: data.connected === true,
          timestamp: data.timestamp as string,
          version: data.version as string
        };
      }
      
      return {
        connected: true
      };
    } catch (error) {
      console.error('Error checking connection:', error);
      return {
        connected: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }
  
  /**
   * Check if database fixes have been applied
   */
  private async checkDatabaseFixes(): Promise<{fixesApplied: boolean, errors?: string[]}> {
    try {
      const { data, error } = await supabase
        .rpc('validate_database_fixes');
      
      if (error) {
        return {
          fixesApplied: false,
          errors: [error.message]
        };
      }
      
      // Handle response based on whether it's an object or array
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return {
          fixesApplied: data.all_fixes_applied === true
        };
      }
      
      return {
        fixesApplied: false,
        errors: ['Invalid response from validate_database_fixes']
      };
    } catch (error) {
      console.error('Error checking database fixes:', error);
      return {
        fixesApplied: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }
}

export const databaseDiagnosticService = new DatabaseDiagnosticService();
