
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to clean up technical debt in the database
 * Removes unnecessary backup tables and standardizes naming
 */
export const cleanupTechnicalDebt = async (): Promise<{
  success: boolean;
  message: string;
  tablesRemoved: string[];
}> => {
  console.log('Starting technical debt cleanup...');
  
  const result = {
    success: false,
    message: '',
    tablesRemoved: [] as string[]
  };
  
  try {
    // List of backup tables to remove
    const backupTables = [
      'call_metrics_summary_backup',
      'rep_metrics_summary_backup',
      'rep_metrics_summary_duplicate_backup',
      'temp_call_metrics_backup'
    ];
    
    // Check each table and drop if it exists
    for (const table of backupTables) {
      try {
        // First check if the table exists using RPC
        const { data: checkData, error: checkError } = await supabase.rpc(
          'check_table_exists',
          { table_name: table }
        );
        
        if (checkError) {
          console.error(`Error checking if ${table} exists:`, checkError);
          continue;
        }
        
        if (!checkData) {
          console.log(`Table ${table} does not exist, skipping`);
          continue;
        }
        
        // Table exists, drop it using execute_sql RPC
        const { error: dropError } = await supabase.rpc(
          'execute_sql',
          { query_text: `DROP TABLE IF EXISTS ${table}` }
        );
        
        if (dropError) {
          console.error(`Error dropping ${table}:`, dropError);
        } else {
          console.log(`Successfully dropped ${table}`);
          result.tablesRemoved.push(table);
        }
      } catch (err) {
        console.error(`Exception handling ${table}:`, err);
      }
    }
    
    result.success = true;
    result.message = `Cleanup complete. Removed ${result.tablesRemoved.length} unnecessary tables.`;
    
    return result;
  } catch (error) {
    console.error('Error in cleanupTechnicalDebt:', error);
    result.message = error instanceof Error ? error.message : 'Unknown error occurred';
    return result;
  }
};
