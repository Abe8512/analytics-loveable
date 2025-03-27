
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates the helper tables needed for database operations
 * This should be run before any of the other database functions
 */
export const setupDatabaseFunctions = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Setting up database functions...");
    
    // Execute SQL to create all the necessary functions directly
    const { error: functionsError } = await supabase.rpc('execute_sql', {
      query_text: `
        -- Function to check if a table exists
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
        
        -- Function to drop a table if it exists
        CREATE OR REPLACE FUNCTION public.drop_table_if_exists(table_name TEXT)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(table_name);
        END;
        $$;
        
        -- Function to set REPLICA IDENTITY FULL
        CREATE OR REPLACE FUNCTION public.set_replica_identity_full(table_name TEXT)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            EXECUTE 'ALTER TABLE ' || quote_ident(table_name) || ' REPLICA IDENTITY FULL';
        END;
        $$;
        
        -- Function to add table to publication
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
        
        -- Function to drop development-only policies
        CREATE OR REPLACE FUNCTION public.drop_development_access_policies(table_name TEXT)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
            policy_name TEXT;
            policy_cursor CURSOR FOR
                SELECT policyname FROM pg_policies 
                WHERE tablename = table_name
                AND schemaname = 'public'
                AND (policyname LIKE '%anon%' OR policyname LIKE '%public%');
        BEGIN
            OPEN policy_cursor;
            LOOP
                FETCH policy_cursor INTO policy_name;
                EXIT WHEN NOT FOUND;
                
                EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || 
                        ' ON public.' || quote_ident(table_name);
            END LOOP;
            CLOSE policy_cursor;
        END;
        $$;
        
        -- Function to create authenticated access policies
        CREATE OR REPLACE FUNCTION public.create_authenticated_access_policies(table_name TEXT)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            -- Create SELECT policy for authenticated users
            EXECUTE 'CREATE POLICY "Allow authenticated users to select" ON ' || 
                    quote_ident(table_name) || 
                    ' FOR SELECT TO authenticated USING (true)';
            
            -- Create INSERT policy for authenticated users
            EXECUTE 'CREATE POLICY "Allow authenticated users to insert" ON ' || 
                    quote_ident(table_name) || 
                    ' FOR INSERT TO authenticated WITH CHECK (true)';
            
            -- Create UPDATE policy for authenticated users
            EXECUTE 'CREATE POLICY "Allow authenticated users to update" ON ' || 
                    quote_ident(table_name) || 
                    ' FOR UPDATE TO authenticated USING (true)';
            
            -- Create DELETE policy for authenticated users (optional - enable if needed)
            EXECUTE 'CREATE POLICY "Allow authenticated users to delete" ON ' || 
                    quote_ident(table_name) || 
                    ' FOR DELETE TO authenticated USING (true)';
        END;
        $$;
      `
    });
    
    if (functionsError) {
      console.error('Error creating database functions:', functionsError);
      return {
        success: false,
        message: `Failed to create database functions: ${functionsError.message}`
      };
    }
    
    return {
      success: true,
      message: 'Successfully set up database functions'
    };
  } catch (error) {
    console.error('Error in setupDatabaseFunctions:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
