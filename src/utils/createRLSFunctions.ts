
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates database functions needed for managing RLS policies
 */
export const createRLSFunctions = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Create function to drop development-only policies
    const { error: dropFunctionError } = await supabase.rpc(
      'execute_sql',
      {
        query_text: `
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
        `
      }
    );
    
    if (dropFunctionError) {
      console.error('Error creating drop_development_access_policies function:', dropFunctionError);
      return {
        success: false,
        message: `Failed to create drop_development_access_policies function: ${dropFunctionError.message}`
      };
    }
    
    // Create function to add authenticated user policies
    const { error: createFunctionError } = await supabase.rpc(
      'execute_sql',
      {
        query_text: `
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
      }
    );
    
    if (createFunctionError) {
      console.error('Error creating create_authenticated_access_policies function:', createFunctionError);
      return {
        success: false,
        message: `Failed to create create_authenticated_access_policies function: ${createFunctionError.message}`
      };
    }
    
    return {
      success: true,
      message: 'Successfully created RLS policy management functions'
    };
  } catch (error) {
    console.error('Error in createRLSFunctions:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
