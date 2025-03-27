
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
      
      // Get list of tables using a custom function or RPC instead of querying information_schema
      const tablesList = await this.getTableList();
      
      // Check if database fixes have been applied
      const fixesResult = await this.checkDatabaseFixes();
      
      return {
        ...connectionResult,
        tables: tablesList,
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
   * Get all tables in the public schema
   */
  private async getTableList(): Promise<string[]> {
    try {
      // Using a stored function would be better, but this is a workaround
      // We can query a single table and check for error to determine if it exists
      const tables = [
        'alerts',
        'call_metrics_summary',
        'call_transcripts',
        'calls',
        'keyword_trends',
        'rep_metrics_summary',
        'team_members',
        'sentiment_trends'
      ];
      
      const confirmedTables: string[] = [];
      
      for (const table of tables) {
        try {
          // Just try to get one row to see if table exists
          const { data, error } = await supabase
            .from(table)
            .select('id')
            .limit(1);
          
          if (!error) {
            confirmedTables.push(table);
          }
        } catch {
          // Table doesn't exist, skip it
        }
      }
      
      return confirmedTables;
    } catch (error) {
      console.error('Error getting table list:', error);
      return [];
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
      // Use a simpler request to check connection
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('id')
        .limit(1);
      
      if (error) {
        return {
          connected: false,
          errors: [error.message]
        };
      }
      
      return {
        connected: true,
        timestamp: new Date().toISOString(),
        version: 'Supabase'
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
      // Check if team_members table exists as a simple check
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .limit(1);
      
      if (error) {
        return {
          fixesApplied: false,
          errors: [error.message]
        };
      }
      
      return {
        fixesApplied: true
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
