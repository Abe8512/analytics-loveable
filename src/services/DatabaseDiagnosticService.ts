
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Type definition for table info
interface TableInfo {
  tableName: string;
  columnCount: number;
  rowCount: number;
  hasRLS: boolean;
  hasGinIndex: boolean;
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
      const { data: tablesInfo, error: tablesError } = await supabase.rpc(
        'execute_sql_with_results',
        { 
          query_text: `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
          `
        }
      );
      
      if (tablesError) {
        results.errors.push(`Error fetching tables: ${tablesError.message}`);
        return;
      }
      
      // Check each table 
      for (const tableObj of tablesInfo || []) {
        const tableName = tableObj.table_name;
        
        // Get column count
        const { data: columnsInfo, error: columnsError } = await supabase.rpc(
          'execute_sql_with_results',
          { 
            query_text: `
              SELECT column_name
              FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = '${tableName}'
            `
          }
        );
          
        if (columnsError) {
          results.errors.push(`Error fetching columns for ${tableName}: ${columnsError.message}`);
          continue;
        }
        
        // Get row count
        const { data: countInfo, error: countError } = await supabase.rpc(
          'execute_sql_with_results',
          { 
            query_text: `SELECT COUNT(*) AS count FROM ${tableName}`
          }
        );
          
        if (countError) {
          results.errors.push(`Error counting rows for ${tableName}: ${countError.message}`);
        }
        
        // Check RLS policies
        const { data: policiesInfo, error: policiesError } = await supabase.rpc(
          'execute_sql_with_results',
          { 
            query_text: `
              SELECT policyname
              FROM pg_policies
              WHERE schemaname = 'public' AND tablename = '${tableName}'
            `
          }
        );
          
        if (policiesError) {
          results.errors.push(`Error fetching policies for ${tableName}: ${policiesError.message}`);
        }
        
        // Check for GIN indexes
        const { data: indexInfo, error: indexError } = await supabase.rpc(
          'execute_sql_with_results',
          { 
            query_text: `
              SELECT indexname, indexdef
              FROM pg_indexes
              WHERE schemaname = 'public' AND tablename = '${tableName}'
            `
          }
        );
          
        if (indexError) {
          results.errors.push(`Error fetching indexes for ${tableName}: ${indexError.message}`);
        }
        
        // Check if any of the indexes are GIN indexes
        const hasGinIndex = indexInfo ? indexInfo.some((idx: any) => 
          idx.indexdef && idx.indexdef.includes('USING gin')
        ) : false;
        
        // Add table info
        results.tables.push({
          tableName,
          columnCount: (columnsInfo?.length || 0),
          rowCount: countInfo?.[0]?.count || 0,
          hasRLS: (policiesInfo?.length || 0) > 0,
          hasGinIndex,
          rlsPolicies: policiesInfo?.map((p: any) => p.policyname) || []
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
      const { data: functionsInfo, error: functionsError } = await supabase.rpc(
        'execute_sql_with_results',
        { 
          query_text: `
            SELECT routine_name, data_type, routine_definition
            FROM information_schema.routines
            WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
          `
        }
      );
        
      if (functionsError) {
        results.errors.push(`Error fetching functions: ${functionsError.message}`);
        return;
      }
      
      // Check key functions
      for (const funcObj of functionsInfo || []) {
        let isWorking = false;
        
        // Test some core functions
        if (funcObj.routine_name === 'check_column_exists') {
          const { data, error } = await supabase.rpc(
            'check_column_exists',
            { 
              p_table_name: 'calls', 
              p_column_name: 'id' 
            }
          );
          isWorking = !error && data === true;
        } 
        else if (funcObj.routine_name === 'check_table_in_publication') {
          const { data, error } = await supabase.rpc(
            'check_table_in_publication',
            { 
              table_name: 'calls',
              publication_name: 'supabase_realtime'
            }
          );
          isWorking = !error;
        }
        else if (funcObj.routine_name === 'check_connection') {
          const { data, error } = await supabase.rpc('check_connection');
          isWorking = !error && data?.connected === true;
        }
        
        results.functions.push({
          functionName: funcObj.routine_name,
          functionArgs: funcObj.data_type || '',
          description: funcObj.routine_definition?.substring(0, 100) || 'No description available',
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
      const { data: triggersInfo, error: triggersError } = await supabase.rpc(
        'execute_sql_with_results',
        { 
          query_text: `
            SELECT trigger_name, event_manipulation, event_object_table, action_statement
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
          `
        }
      );
        
      if (triggersError) {
        results.errors.push(`Error fetching triggers: ${triggersError.message}`);
        return;
      }
      
      results.triggerInfo = triggersInfo || [];
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
      // Test with a dummy call transcript
      const testId = uuidv4();
      const dummyData = { 
        id: testId,
        user_id: 'test-diagnostics',
        filename: 'diagnostic-test.wav',
        text: 'This is a diagnostic test transcript',
        duration: 1,
        created_at: new Date().toISOString()
      };
      
      // Try to save call transcript
      const { data: saveResult, error: saveError } = await supabase.functions.invoke('save-call-transcript', {
        body: { data: dummyData }
      });
      
      if (saveError) {
        results.errors.push(`Error testing save_call_transcript edge function: ${saveError.message}`);
        
        // Try direct insert as fallback
        try {
          const { data: insertResult, error: insertError } = await supabase
            .from('call_transcripts')
            .insert(dummyData)
            .select();
          
          if (insertError) {
            results.errors.push(`Error with direct insert fallback: ${insertError.message}`);
          } else {
            results.uploadPathWorkingCorrectly = true;
            console.log('Direct insert fallback was successful:', insertResult);
          }
        } catch (insertCatchError) {
          results.errors.push(`Direct insert fallback exception: ${insertCatchError instanceof Error ? insertCatchError.message : String(insertCatchError)}`);
        }
        
        return;
      }
      
      // Check if we got a success response
      if (saveResult && saveResult.success) {
        results.uploadPathWorkingCorrectly = true;
        
        // Try to clean up the test record
        await supabase
          .from('call_transcripts')
          .delete()
          .eq('id', testId);
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
      if (table.hasGinIndex) {
        report += `, GIN Index Enabled`;
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
