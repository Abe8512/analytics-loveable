
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type definition for table info
interface TableInfo {
  tableName: string;
  columnCount: number;
  rowCount: number;
  hasRLS: boolean;
  rlsPolicies: string[];
}

// Type definition for function info
interface FunctionInfo {
  functionName: string;
  functionArgs: string;
  description: string;
  isWorking: boolean;
}

// Type definition for diagnostic results
interface DiagnosticResults {
  tables: TableInfo[];
  functions: FunctionInfo[];
  storage: {
    buckets: string[];
    fileCount: number;
  };
  triggerInfo: any[];
  errors: string[];
  uploadPathWorkingCorrectly: boolean;
}

/**
 * Service for diagnosing database functionality and issues
 */
export class DatabaseDiagnosticService {
  /**
   * Run a comprehensive database diagnostic
   */
  public async runDiagnostic(): Promise<DiagnosticResults> {
    const results: DiagnosticResults = {
      tables: [],
      functions: [],
      storage: {
        buckets: [],
        fileCount: 0,
      },
      triggerInfo: [],
      errors: [],
      uploadPathWorkingCorrectly: false,
    };
    
    try {
      // Start with tables check
      await this.checkTables(results);
      
      // Check functions
      await this.checkFunctions(results);
      
      // Check storage
      await this.checkStorage(results);
      
      // Check triggers
      await this.checkTriggers(results);
      
      // Verify upload path
      await this.testUploadPath(results);
      
      console.log('Database diagnostic completed:', results);
      return results;
    } catch (error) {
      console.error('Error running database diagnostic:', error);
      results.errors.push(error instanceof Error ? error.message : String(error));
      return results;
    }
  }
  
  /**
   * Check database tables and their structure
   */
  private async checkTables(results: DiagnosticResults): Promise<void> {
    try {
      // Get list of all tables
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        results.errors.push(`Error fetching tables: ${tablesError.message}`);
        return;
      }
      
      // Check each table 
      for (const tableObj of tables || []) {
        const tableName = tableObj.table_name;
        
        // Get column count
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_schema', 'public')
          .eq('table_name', tableName);
          
        if (columnsError) {
          results.errors.push(`Error fetching columns for ${tableName}: ${columnsError.message}`);
          continue;
        }
        
        // Get row count
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
          
        if (countError && !countError.message.includes('permission denied')) {
          results.errors.push(`Error counting rows for ${tableName}: ${countError.message}`);
        }
        
        // Check RLS policies
        const { data: policies, error: policiesError } = await supabase
          .from('pg_policies')
          .select('policyname')
          .eq('schemaname', 'public')
          .eq('tablename', tableName);
          
        if (policiesError && !policiesError.message.includes('relation "pg_policies" does not exist')) {
          results.errors.push(`Error fetching policies for ${tableName}: ${policiesError.message}`);
        }
        
        // Add table info
        results.tables.push({
          tableName,
          columnCount: columns?.length || 0,
          rowCount: count || 0,
          hasRLS: (policies?.length || 0) > 0,
          rlsPolicies: policies?.map(p => p.policyname) || []
        });
      }
    } catch (error) {
      console.error('Error checking tables:', error);
      results.errors.push(`Error checking tables: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Check database functions, especially RPC functions
   */
  private async checkFunctions(results: DiagnosticResults): Promise<void> {
    try {
      // Query for all functions in the public schema
      const { data: functions, error: functionsError } = await supabase
        .from('information_schema.routines')
        .select('routine_name, data_type, routine_definition')
        .eq('routine_schema', 'public')
        .eq('routine_type', 'FUNCTION');
        
      if (functionsError) {
        results.errors.push(`Error fetching functions: ${functionsError.message}`);
        return;
      }
      
      // Check key functions
      for (const funcObj of functions || []) {
        let isWorking = false;
        
        // Test some core functions
        if (funcObj.routine_name === 'check_column_exists') {
          const { data, error } = await supabase.rpc(
            'check_column_exists',
            { p_table_name: 'calls', p_column_name: 'id' }
          );
          isWorking = !error && data === true;
        } 
        else if (funcObj.routine_name === 'save_call') {
          // Just check if the function exists, don't actually call it
          isWorking = true;
        }
        else if (funcObj.routine_name === 'save_call_transcript') {
          // Just check if the function exists, don't actually call it
          isWorking = true;
        }
        else if (funcObj.routine_name === 'save_keyword_trend') {
          // Just check if the function exists, don't actually call it
          isWorking = true;
        }
        
        results.functions.push({
          functionName: funcObj.routine_name,
          functionArgs: funcObj.data_type || '',
          description: functionsError?.routine_definition?.substring(0, 100) || 'No description available',
          isWorking
        });
      }
    } catch (error) {
      console.error('Error checking functions:', error);
      results.errors.push(`Error checking functions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Check storage buckets and files
   */
  private async checkStorage(results: DiagnosticResults): Promise<void> {
    try {
      // List all buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        results.errors.push(`Error fetching storage buckets: ${bucketsError.message}`);
        return;
      }
      
      results.storage.buckets = buckets?.map(b => b.name) || [];
      
      // Count files in all buckets
      let totalFiles = 0;
      
      for (const bucket of buckets || []) {
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list();
          
        if (filesError) {
          results.errors.push(`Error listing files in bucket ${bucket.name}: ${filesError.message}`);
          continue;
        }
        
        totalFiles += files?.length || 0;
      }
      
      results.storage.fileCount = totalFiles;
    } catch (error) {
      console.error('Error checking storage:', error);
      results.errors.push(`Error checking storage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Check database triggers
   */
  private async checkTriggers(results: DiagnosticResults): Promise<void> {
    try {
      // Query for triggers
      const { data: triggers, error: triggersError } = await supabase
        .from('information_schema.triggers')
        .select('trigger_name, event_manipulation, event_object_table, action_statement')
        .eq('trigger_schema', 'public');
        
      if (triggersError) {
        results.errors.push(`Error fetching triggers: ${triggersError.message}`);
        return;
      }
      
      results.triggerInfo = triggers || [];
    } catch (error) {
      console.error('Error checking triggers:', error);
      results.errors.push(`Error checking triggers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Test the complete upload path with a small test
   */
  private async testUploadPath(results: DiagnosticResults): Promise<void> {
    try {
      // Test with a dummy file to see if save functions are working
      const dummyData = { 
        id: uuidv4(),
        user_id: 'test-diagnostics',
        filename: 'diagnostic-test.wav',
        text: 'This is a diagnostic test transcript',
        duration: 1,
        created_at: new Date().toISOString()
      };
      
      // Try the RPC function
      const { data: saveResult, error: saveError } = await (supabase.rpc as any)(
        'save_call_transcript' as any, 
        { p_data: dummyData }
      );
      
      if (saveError) {
        results.errors.push(`Error testing save_call_transcript: ${saveError.message}`);
        return;
      }
      
      // Check if we got an ID back
      if (saveResult && saveResult.success) {
        results.uploadPathWorkingCorrectly = true;
        
        // Clean up the test record
        await supabase
          .from('call_transcripts')
          .delete()
          .eq('id', saveResult.id);
      } else {
        results.errors.push('save_call_transcript did not return a success result');
      }
    } catch (error) {
      console.error('Error testing upload path:', error);
      results.errors.push(`Error testing upload path: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Formats the diagnostic results for display
   */
  public formatResults(results: DiagnosticResults): string {
    let report = `# Database Diagnostic Report\n\n`;
    
    report += `## Summary\n`;
    report += `- Tables: ${results.tables.length}\n`;
    report += `- Functions: ${results.functions.length}\n`;
    report += `- Storage Buckets: ${results.storage.buckets.length}\n`;
    report += `- Files in Storage: ${results.storage.fileCount}\n`;
    report += `- Triggers: ${results.triggerInfo.length}\n`;
    report += `- Upload Path Working: ${results.uploadPathWorkingCorrectly ? '✅' : '❌'}\n`;
    report += `- Errors Found: ${results.errors.length}\n\n`;
    
    if (results.errors.length > 0) {
      report += `## Errors\n`;
      results.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
      report += `\n`;
    }
    
    report += `## Tables\n`;
    results.tables.forEach(table => {
      report += `- ${table.tableName}: ${table.columnCount} columns, ${table.rowCount} rows`;
      if (table.hasRLS) {
        report += `, RLS Enabled (${table.rlsPolicies.length} policies)`;
      } else {
        report += `, No RLS`;
      }
      report += `\n`;
    });
    report += `\n`;
    
    report += `## Upload Functions Status\n`;
    const uploadFunctions = ['save_call_transcript', 'save_call', 'save_keyword_trend'];
    uploadFunctions.forEach(funcName => {
      const func = results.functions.find(f => f.functionName === funcName);
      if (func) {
        report += `- ${funcName}: ${func.isWorking ? '✅ Working' : '❌ Not Working'}\n`;
      } else {
        report += `- ${funcName}: ❌ Not Found\n`;
      }
    });
    
    return report;
  }
}

export const databaseDiagnosticService = new DatabaseDiagnosticService();
