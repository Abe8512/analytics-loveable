
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from './ErrorHandlingService';

interface DatabaseTable {
  name: string;
  exists: boolean;
  columns: DatabaseColumn[];
}

interface DatabaseColumn {
  name: string;
  type: string;
  exists: boolean;
}

interface DiagnosticResult {
  connected: boolean;
  tables: {
    name: string;
    exists: boolean;
    columns: Array<{
      name: string;
      type: string;
      exists: boolean;
    }>;
  }[];
  status: string;
}

export class DatabaseDiagnosticService {
  private schemaCache: Record<string, any> = {};
  
  constructor() {
    // Initialize service
  }
  
  async checkTableExists(tableName: string): Promise<boolean> {
    try {
      // Use RPC call to check if table exists
      const { data, error } = await supabase
        .rpc('check_table_exists', { table_name: tableName });
      
      if (error) {
        console.error(`Error checking if table ${tableName} exists:`, error);
        return false;
      }
      
      return data as boolean;
    } catch (error) {
      console.error(`Exception checking if table ${tableName} exists:`, error);
      errorHandler.handleError(error, 'DatabaseDiagnosticService.checkTableExists');
      return false;
    }
  }
  
  async getTableMetadata(): Promise<any[]> {
    try {
      // Get a list of tables
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.error('Error getting table metadata:', tablesError);
        return [];
      }
      
      // If we found tables, map them into a more useful format
      return (tables || []).map((table: any) => ({
        table_name: table.table_name,
        table_type: 'BASE TABLE',
        table_schema: 'public'
      }));
    } catch (error) {
      console.error('Exception getting table metadata:', error);
      errorHandler.handleError(error, 'DatabaseDiagnosticService.getTableMetadata');
      return [];
    }
  }
  
  async getTableColumns(tableName: string): Promise<DatabaseColumn[]> {
    try {
      // Query directly for columns
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');
      
      if (error) {
        console.error(`Error getting columns for table ${tableName}:`, error);
        return [];
      }
      
      return (data as any[] || []).map((column: any) => ({
        name: column.column_name,
        type: column.data_type,
        exists: true
      }));
    } catch (error) {
      console.error(`Exception getting columns for table ${tableName}:`, error);
      errorHandler.handleError(error, 'DatabaseDiagnosticService.getTableColumns');
      return [];
    }
  }
  
  async checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
    try {
      // Query directly for the column
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .eq('column_name', columnName)
        .maybeSingle();
      
      if (error) {
        console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error(`Exception checking if column ${columnName} exists in table ${tableName}:`, error);
      errorHandler.handleError(error, 'DatabaseDiagnosticService.checkColumnExists');
      return false;
    }
  }
  
  async runDiagnostic(): Promise<DiagnosticResult> {
    try {
      // Check connection
      const connectionCheck = await this.checkConnection();
      
      // Get table names
      const tableMetadata = await this.getTableMetadata();
      
      // Build detailed table info
      const tables: DatabaseTable[] = [];
      
      for (const table of tableMetadata) {
        const columns = await this.getTableColumns(table.table_name);
        
        tables.push({
          name: table.table_name,
          exists: true,
          columns
        });
      }
      
      return {
        tables,
        connected: connectionCheck.canConnect,
        status: connectionCheck.status
      };
    } catch (error) {
      console.error('Error getting database diagnostics:', error);
      errorHandler.handleError(error, 'DatabaseDiagnosticService.runDiagnostic');
      
      return {
        tables: [],
        connected: false,
        status: 'Error getting database diagnostics'
      };
    }
  }
  
  async checkConnection(): Promise<{
    canConnect: boolean;
    status: string;
  }> {
    try {
      console.log('Checking Supabase connection...');
      
      // Simple query to test connection
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection failed:', error);
        return {
          canConnect: false,
          status: `Connection failed: ${error.message}`
        };
      }
      
      console.log('Supabase connection successful, found data:', data);
      
      return {
        canConnect: true,
        status: 'Connected successfully'
      };
    } catch (error) {
      console.error('Supabase connection error:', error);
      
      return {
        canConnect: false,
        status: error instanceof Error ? error.message : 'Unknown error connecting to database'
      };
    }
  }

  formatResults(diagnosticResults: DiagnosticResult): string {
    let result = '';

    // Format connection status
    result += `Connection: ${diagnosticResults.connected ? 'Connected' : 'Disconnected'}\n`;
    result += `Status: ${diagnosticResults.status}\n\n`;

    // Format tables information
    result += 'Tables:\n';
    result += '==============================\n';
    
    if (diagnosticResults.tables.length === 0) {
      result += 'No tables found or unable to retrieve table information.\n';
    } else {
      diagnosticResults.tables.forEach(table => {
        result += `Table: ${table.name} (${table.exists ? 'Exists' : 'Missing'})\n`;
        
        result += '  Columns:\n';
        if (table.columns.length === 0) {
          result += '    No columns found or unable to retrieve column information.\n';
        } else {
          table.columns.forEach(column => {
            result += `    - ${column.name} (${column.type})\n`;
          });
        }
        result += '\n';
      });
    }

    return result;
  }
}

// Export a singleton instance for easier use
export const databaseDiagnosticService = new DatabaseDiagnosticService();
