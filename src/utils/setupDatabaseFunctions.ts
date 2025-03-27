
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates the helper tables needed for database operations
 * This should be run before any of the other database functions
 */
export const setupDatabaseFunctions = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Setting up database function tables...");
    
    // Create _database_setup table for function setup operations
    const { error: setupTableError } = await supabase.rpc('execute_sql', {
      query_text: `
        CREATE TABLE IF NOT EXISTS public._database_setup (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          setup_function TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT now()
        );
        
        ALTER TABLE public._database_setup ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow public access to _database_setup" 
          ON public._database_setup 
          FOR ALL 
          TO anon
          USING (true);
      `
    });
    
    if (setupTableError) {
      console.error('Error creating _database_setup table:', setupTableError);
      return {
        success: false,
        message: `Failed to create setup table: ${setupTableError.message}`
      };
    }
    
    // Create _database_functions table for function execution
    const { error: functionsTableError } = await supabase.rpc('execute_sql', {
      query_text: `
        CREATE TABLE IF NOT EXISTS public._database_functions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          function_name TEXT NOT NULL,
          param_table_name TEXT,
          param_column_name TEXT,
          param_publication_name TEXT,
          result JSONB,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT now()
        );
        
        ALTER TABLE public._database_functions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow public access to _database_functions" 
          ON public._database_functions 
          FOR ALL 
          TO anon
          USING (true);
          
        -- Create triggers to execute functions when rows are inserted
        CREATE OR REPLACE FUNCTION public.execute_database_function()
        RETURNS TRIGGER AS $$
        DECLARE
          result_data JSONB;
        BEGIN
          -- Execute the appropriate function based on the function_name
          IF NEW.function_name = 'check_table_exists' THEN
            SELECT to_jsonb(check_table_exists(NEW.param_table_name)) INTO result_data;
          ELSIF NEW.function_name = 'drop_table_if_exists' THEN
            PERFORM drop_table_if_exists(NEW.param_table_name);
            result_data := '{"success": true}'::jsonb;
          ELSIF NEW.function_name = 'set_replica_identity_full' THEN
            PERFORM set_replica_identity_full(NEW.param_table_name);
            result_data := '{"success": true}'::jsonb;
          ELSIF NEW.function_name = 'add_table_to_publication' THEN
            PERFORM add_table_to_publication(NEW.param_table_name, NEW.param_publication_name);
            result_data := '{"success": true}'::jsonb;
          ELSIF NEW.function_name = 'drop_development_access_policies' THEN
            PERFORM drop_development_access_policies(NEW.param_table_name);
            result_data := '{"success": true}'::jsonb;
          ELSIF NEW.function_name = 'create_authenticated_access_policies' THEN
            PERFORM create_authenticated_access_policies(NEW.param_table_name);
            result_data := '{"success": true}'::jsonb;
          ELSE
            result_data := jsonb_build_object('error', 'Unknown function: ' || NEW.function_name);
          END IF;
          
          -- Update the result
          UPDATE public._database_functions 
          SET result = result_data, 
              status = 'completed' 
          WHERE id = NEW.id;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS execute_database_function_trigger ON public._database_functions;
        
        CREATE TRIGGER execute_database_function_trigger
        AFTER INSERT ON public._database_functions
        FOR EACH ROW
        EXECUTE FUNCTION public.execute_database_function();
        
        -- Create trigger for setup functions
        CREATE OR REPLACE FUNCTION public.execute_setup_function()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Execute the appropriate setup function
          IF NEW.setup_function = 'create_check_table_exists_function' THEN
            PERFORM create_check_table_exists_function();
          ELSIF NEW.setup_function = 'create_drop_table_function' THEN
            PERFORM create_drop_table_function();
          ELSIF NEW.setup_function = 'create_set_replica_identity_function' THEN
            PERFORM create_set_replica_identity_function();
          ELSIF NEW.setup_function = 'create_add_to_publication_function' THEN
            PERFORM create_add_to_publication_function();
          ELSIF NEW.setup_function = 'create_drop_development_policies_function' THEN
            PERFORM create_drop_development_policies_function();
          ELSIF NEW.setup_function = 'create_authenticated_policies_function' THEN
            PERFORM create_authenticated_policies_function();
          END IF;
          
          -- Update status
          UPDATE public._database_setup
          SET status = 'completed'
          WHERE id = NEW.id;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS execute_setup_function_trigger ON public._database_setup;
        
        CREATE TRIGGER execute_setup_function_trigger
        AFTER INSERT ON public._database_setup
        FOR EACH ROW
        EXECUTE FUNCTION public.execute_setup_function();
      `
    });
    
    if (functionsTableError) {
      console.error('Error creating _database_functions table:', functionsTableError);
      return {
        success: false,
        message: `Failed to create functions table: ${functionsTableError.message}`
      };
    }
    
    return {
      success: true,
      message: 'Successfully set up database function tables'
    };
  } catch (error) {
    console.error('Error in setupDatabaseFunctions:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
