import { supabase } from '@/integrations/supabase/client';

interface RealtimeEnableResult {
  table: string;
  success: boolean;
  error?: any;
}

/**
 * Service for managing realtime functionality in Supabase tables
 */
export const realtimeService = {
  /**
   * Enable realtime functionality for a table
   */
  enableRealtimeForTable: async (tableName: string): Promise<RealtimeEnableResult> => {
    try {
      console.log(`Enabling realtime for table: ${tableName}`);
      
      // Set the table to REPLICA IDENTITY FULL to ensure complete row data is captured
      const { data: replicaData, error: replicaError } = await supabase.rpc(
        'execute_sql',
        { query_text: `ALTER TABLE ${tableName} REPLICA IDENTITY FULL` }
      );
      
      if (replicaError) {
        console.error(`Error setting replica identity for ${tableName}:`, replicaError);
        return { table: tableName, success: false, error: replicaError };
      }
      
      // Add the table to the realtime publication if it's not already there
      const { data: checkResult, error: checkError } = await supabase.rpc(
        'check_table_in_publication', 
        { 
          table_name: tableName,
          publication_name: 'supabase_realtime'
        }
      );
      
      if (checkError) {
        console.error(`Error checking publication status for ${tableName}:`, checkError);
        return { table: tableName, success: false, error: checkError };
      }
      
      // If the table is already in the publication, we're done
      if (checkResult === true) {
        console.log(`Table ${tableName} is already in the realtime publication`);
        return { table: tableName, success: true };
      }
      
      // Otherwise, add it to the publication
      const { data: pubData, error: pubError } = await supabase.rpc(
        'add_table_to_realtime_publication',
        { table_name: tableName }
      );
      
      if (pubError) {
        console.error(`Error adding ${tableName} to publication:`, pubError);
        return { table: tableName, success: false, error: pubError };
      }
      
      console.log(`Successfully enabled realtime for ${tableName}`);
      return { table: tableName, success: true };
    } catch (error) {
      console.error(`Failed to enable realtime for ${tableName}:`, error);
      return { table: tableName, success: false, error };
    }
  },
  
  /**
   * Check if a table has realtime enabled
   */
  checkTableRealtimeStatus: async (tableName: string): Promise<boolean> => {
    try {
      // Check if the table is in the realtime publication
      const { data, error } = await supabase.rpc(
        'check_table_in_publication', 
        { 
          table_name: tableName,
          publication_name: 'supabase_realtime'
        }
      );
      
      if (error) {
        console.error(`Error checking realtime status for ${tableName}:`, error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error(`Failed to check realtime status for ${tableName}:`, error);
      return false;
    }
  },
  
  /**
   * Enable realtime for all important tables
   */
  enableRealtimeForAllTables: async (): Promise<RealtimeEnableResult[]> => {
    const tables = [
      'call_transcripts',
      'calls',
      'keyword_trends', 
      'sentiment_trends',
      'team_members',
      'call_metrics_summary',
      'rep_metrics_summary'
    ];
    
    const results: RealtimeEnableResult[] = [];
    
    for (const table of tables) {
      const result = await realtimeService.enableRealtimeForTable(table);
      results.push(result);
    }
    
    return results;
  }
};
