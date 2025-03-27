
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for enabling realtime functionality in Supabase tables
 */
export const realtimeService = {
  /**
   * Enable realtime functionality for a table
   */
  enableRealtimeForTable: async (tableName: string) => {
    try {
      console.log(`Enabling realtime for table: ${tableName}`);
      
      // Set the table to REPLICA IDENTITY FULL directly
      const { data, error } = await supabase.rpc(
        'execute_sql',
        { query_text: `ALTER TABLE ${tableName} REPLICA IDENTITY FULL` }
      );
      
      if (error) {
        console.error(`Error setting replica identity for ${tableName}:`, error);
        return { table: tableName, success: false, error };
      }
      
      // Add the table to the realtime publication
      const { data: pubData, error: pubError } = await supabase.rpc(
        'execute_sql',
        { 
          query_text: `
            DO $$
            BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
                CREATE PUBLICATION supabase_realtime;
              END IF;
              
              IF NOT EXISTS (
                SELECT 1 FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' 
                AND schemaname = 'public' 
                AND tablename = '${tableName}'
              ) THEN
                ALTER PUBLICATION supabase_realtime ADD TABLE ${tableName};
              END IF;
            END
            $$;
          `
        }
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
  checkRealtimeEnabled: async (tableName: string) => {
    try {
      // Query to check if the table is in the realtime publication
      const { data, error } = await supabase.rpc(
        'execute_sql_with_results',
        { 
          query_text: `
            SELECT EXISTS (
              SELECT 1 FROM pg_publication_tables
              WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public'
              AND tablename = '${tableName}'
            ) as in_publication
          `
        }
      );
      
      if (error) {
        console.error(`Error checking realtime status for ${tableName}:`, error);
        return { enabled: false, error };
      }
      
      const result = data && data[0] ? data[0].in_publication : false;
      return { enabled: !!result };
    } catch (error) {
      console.error(`Failed to check realtime status for ${tableName}:`, error);
      return { enabled: false, error };
    }
  },
  
  /**
   * Enable realtime for all important tables
   */
  enableRealtimeForAllTables: async () => {
    const tables = [
      'call_transcripts',
      'calls',
      'keyword_trends', 
      'sentiment_trends'
    ];
    
    const results = [];
    for (const table of tables) {
      const result = await realtimeService.enableRealtimeForTable(table);
      results.push({ table, ...result });
    }
    
    return results;
  }
};
