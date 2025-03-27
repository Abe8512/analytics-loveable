
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to update database RLS policies to be production-ready
 * Addresses security concerns by removing public access for anon users
 */
export const secureRLSPolicies = async (): Promise<{
  success: boolean;
  message: string;
  updated: string[];
  failed: string[];
}> => {
  console.log('Starting RLS policy updates for production security...');
  
  const result = {
    success: false,
    message: '',
    updated: [] as string[],
    failed: [] as string[]
  };
  
  try {
    // List of tables to secure
    const tables = [
      'call_transcripts',
      'calls',
      'keyword_trends',
      'call_metrics_summary',
      'sentiment_trends',
      'rep_metrics_summary'
    ];
    
    // 1. Drop the development-only policies that allow full public access
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from('_database_functions')
          .insert({
            function_name: 'drop_development_access_policies',
            param_table_name: table
          });
        
        if (error) {
          console.error(`Error dropping development policies for ${table}:`, error);
          result.failed.push(`${table} (drop policies)`);
        } else {
          console.log(`Successfully dropped development policies for ${table}`);
          result.updated.push(`${table} (drop policies)`);
        }
      } catch (err) {
        console.error(`Exception dropping policies for ${table}:`, err);
        result.failed.push(`${table} (drop policies)`);
      }
    }
    
    // 2. Create proper authenticated-user policies
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from('_database_functions')
          .insert({
            function_name: 'create_authenticated_access_policies',
            param_table_name: table
          });
        
        if (error) {
          console.error(`Error creating authenticated policies for ${table}:`, error);
          result.failed.push(`${table} (create policies)`);
        } else {
          console.log(`Successfully created authenticated policies for ${table}`);
          result.updated.push(`${table} (create policies)`);
        }
      } catch (err) {
        console.error(`Exception creating policies for ${table}:`, err);
        result.failed.push(`${table} (create policies)`);
      }
    }
    
    result.success = result.failed.length === 0;
    result.message = result.success 
      ? 'Successfully updated all RLS policy for production security' 
      : `Updated some RLS policies, but ${result.failed.length} operations failed`;
    
    return result;
  } catch (error) {
    console.error('Error in secureRLSPolicies:', error);
    result.message = error instanceof Error ? error.message : 'Unknown error occurred';
    return result;
  }
};
