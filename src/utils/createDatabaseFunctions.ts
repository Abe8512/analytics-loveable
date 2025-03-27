
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates database functions needed for the application
 */
export const createDatabaseFunctions = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Create utility function to check if a table exists
    const { error: checkTableError } = await supabase.rpc(
      'execute_sql',
      {
        query_text: `
          CREATE OR REPLACE FUNCTION public.check_table_exists(table_name TEXT)
          RETURNS BOOLEAN
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
              RETURN EXISTS (
                  SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = $1
              );
          END;
          $$;
        `
      }
    );
    
    if (checkTableError) {
      console.error('Error creating check_table_exists function:', checkTableError);
      return {
        success: false,
        message: `Failed to create check_table_exists function: ${checkTableError.message}`
      };
    }
    
    // Create utility function to drop a table if it exists
    const { error: dropTableError } = await supabase.rpc(
      'execute_sql',
      {
        query_text: `
          CREATE OR REPLACE FUNCTION public.drop_table_if_exists(table_name TEXT)
          RETURNS VOID
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(table_name);
          END;
          $$;
        `
      }
    );
    
    if (dropTableError) {
      console.error('Error creating drop_table_if_exists function:', dropTableError);
      return {
        success: false,
        message: `Failed to create drop_table_if_exists function: ${dropTableError.message}`
      };
    }
    
    // Create utility function to set REPLICA IDENTITY FULL
    const { error: replicaError } = await supabase.rpc(
      'execute_sql',
      {
        query_text: `
          CREATE OR REPLACE FUNCTION public.set_replica_identity_full(table_name TEXT)
          RETURNS VOID
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
              EXECUTE 'ALTER TABLE ' || quote_ident(table_name) || ' REPLICA IDENTITY FULL';
          END;
          $$;
        `
      }
    );
    
    if (replicaError) {
      console.error('Error creating set_replica_identity_full function:', replicaError);
      return {
        success: false,
        message: `Failed to create set_replica_identity_full function: ${replicaError.message}`
      };
    }
    
    // Create utility function to add table to publication
    const { error: publicationError } = await supabase.rpc(
      'execute_sql',
      {
        query_text: `
          CREATE OR REPLACE FUNCTION public.add_table_to_publication(
            table_name TEXT, 
            publication_name TEXT DEFAULT 'supabase_realtime'
          )
          RETURNS VOID
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
              -- Check if publication exists, if not create it
              EXECUTE 'SELECT true FROM pg_publication WHERE pubname = $1'
              USING publication_name;
              
              IF NOT FOUND THEN
                  EXECUTE 'CREATE PUBLICATION ' || quote_ident(publication_name) || 
                          ' FOR ALL TABLES WITH (publish = ''insert,update,delete'')';
              END IF;
              
              -- Add table to publication
              BEGIN
                  EXECUTE 'ALTER PUBLICATION ' || quote_ident(publication_name) || 
                          ' ADD TABLE ' || quote_ident(table_name);
              EXCEPTION
                  WHEN duplicate_object THEN
                      -- Table already in publication, that's fine
                      NULL;
              END;
          END;
          $$;
        `
      }
    );
    
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
