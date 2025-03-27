
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates database functions needed for the application
 */
export const createDatabaseFunctions = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Create utility function to check if a table exists
    const { error: checkTableError } = await supabase
      .from('_database_setup')
      .insert({
        setup_function: 'create_check_table_exists_function'
      });
    
    if (checkTableError) {
      console.error('Error creating check_table_exists function:', checkTableError);
      return {
        success: false,
        message: `Failed to create check_table_exists function: ${checkTableError.message}`
      };
    }
    
    // Create utility function to drop a table if it exists
    const { error: dropTableError } = await supabase
      .from('_database_setup')
      .insert({
        setup_function: 'create_drop_table_function'
      });
    
    if (dropTableError) {
      console.error('Error creating drop_table_if_exists function:', dropTableError);
      return {
        success: false,
        message: `Failed to create drop_table_if_exists function: ${dropTableError.message}`
      };
    }
    
    // Create utility function to set REPLICA IDENTITY FULL
    const { error: replicaError } = await supabase
      .from('_database_setup')
      .insert({
        setup_function: 'create_set_replica_identity_function'
      });
    
    if (replicaError) {
      console.error('Error creating set_replica_identity_full function:', replicaError);
      return {
        success: false,
        message: `Failed to create set_replica_identity_full function: ${replicaError.message}`
      };
    }
    
    // Create utility function to add table to publication
    const { error: publicationError } = await supabase
      .from('_database_setup')
      .insert({
        setup_function: 'create_add_to_publication_function'
      });
    
    if (publicationError) {
      console.error('Error creating add_table_to_publication function:', publicationError);
      return {
        success: false,
        message: `Failed to create add_table_to_publication function: ${publicationError.message}`
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
