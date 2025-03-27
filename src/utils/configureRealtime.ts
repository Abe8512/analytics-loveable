
import { supabase } from "@/integrations/supabase/client";

/**
 * Configures tables for Realtime updates to ensure proper
 * real-time functionality across the application
 */
export const configureRealtime = async (): Promise<{
  success: boolean;
  message: string;
  tablesConfigured: string[];
  failed: string[];
}> => {
  console.log('Starting Realtime configuration...');
  
  const result = {
    success: false,
    message: '',
    tablesConfigured: [] as string[],
    failed: [] as string[]
  };
  
  try {
    // List of tables that should have real-time enabled
    const realtimeTables = [
      'call_transcripts',
      'calls',
      'keyword_trends',
      'call_metrics_summary',
      'sentiment_trends',
      'rep_metrics_summary',
      'team_members'
    ];
    
    // Set REPLICA IDENTITY FULL and add to supabase_realtime publication
    for (const table of realtimeTables) {
      try {
        // Set REPLICA IDENTITY to FULL using RPC
        const { error: replicaError } = await supabase.rpc(
          'execute_sql',
          { query_text: `ALTER TABLE ${table} REPLICA IDENTITY FULL` }
        );
        
        if (replicaError) {
          console.error(`Error setting REPLICA IDENTITY for ${table}:`, replicaError);
          result.failed.push(`${table} (replica identity)`);
          continue;
        }
        
        // Add table to supabase_realtime publication using RPC
        const { error: pubError } = await supabase.rpc(
          'execute_sql',
          { 
            query_text: `
              DO $$
              BEGIN
                IF NOT EXISTS (
                  SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
                ) THEN
                  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
                END IF;
                
                ALTER PUBLICATION supabase_realtime ADD TABLE ${table};
              EXCEPTION
                WHEN duplicate_object THEN
                  -- Table already in publication, that's fine
                  NULL;
              END
              $$;
            `
          }
        );
        
        if (pubError) {
          console.error(`Error adding ${table} to publication:`, pubError);
          result.failed.push(`${table} (publication)`);
          continue;
        }
        
        console.log(`Successfully configured Realtime for ${table}`);
        result.tablesConfigured.push(table);
        
      } catch (err) {
        console.error(`Exception configuring Realtime for ${table}:`, err);
        result.failed.push(table);
      }
    }
    
    result.success = result.failed.length === 0;
    result.message = result.success 
      ? 'Successfully configured all tables for Realtime' 
      : `Configured ${result.tablesConfigured.length} tables for Realtime, but ${result.failed.length} operations failed`;
    
    return result;
  } catch (error) {
    console.error('Error in configureRealtime:', error);
    result.message = error instanceof Error ? error.message : 'Unknown error occurred';
    return result;
  }
};
