
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates database functions needed for the application
 */
export const createDatabaseFunctions = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Create utility function to check if a table exists
    const checkTableResult = await supabase.rpc('create_check_table_exists_function');
    
    if (checkTableResult.error) {
      console.error('Error creating check_table_exists function:', checkTableResult.error);
      return {
        success: false,
        message: `Failed to create check_table_exists function: ${checkTableResult.error.message}`
      };
    }
    
    // Create utility function to drop a table if it exists
    const dropTableResult = await supabase.rpc('create_drop_table_function');
    
    if (dropTableResult.error) {
      console.error('Error creating drop_table_if_exists function:', dropTableResult.error);
      return {
        success: false,
        message: `Failed to create drop_table_if_exists function: ${dropTableResult.error.message}`
      };
    }
    
    // Create utility function to set REPLICA IDENTITY FULL
    const replicaResult = await supabase.rpc('create_set_replica_identity_function');
    
    if (replicaResult.error) {
      console.error('Error creating set_replica_identity_full function:', replicaResult.error);
      return {
        success: false,
        message: `Failed to create set_replica_identity_full function: ${replicaResult.error.message}`
      };
    }
    
    // Create utility function to add table to publication
    const publicationResult = await supabase.rpc('create_add_to_publication_function');
    
    if (publicationResult.error) {
      console.error('Error creating add_table_to_publication function:', publicationResult.error);
      return {
        success: false,
        message: `Failed to create add_table_to_publication function: ${publicationResult.error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Successfully created database utility functions'
    };
  } catch (error) {
    console.error('Error in createDatabaseFunctions:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
