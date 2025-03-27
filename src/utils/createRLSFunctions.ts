
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates database functions needed for managing RLS policies
 */
export const createRLSFunctions = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Create function to drop development-only policies
    const { error: dropFunctionError } = await supabase
      .from('_database_setup')
      .insert({
        setup_function: 'create_drop_development_policies_function'
      });
    
    if (dropFunctionError) {
      console.error('Error creating drop_development_access_policies function:', dropFunctionError);
      return {
        success: false,
        message: `Failed to create drop_development_access_policies function: ${dropFunctionError.message}`
      };
    }
    
    // Create function to add authenticated user policies
    const { error: createFunctionError } = await supabase
      .from('_database_setup')
      .insert({
        setup_function: 'create_authenticated_policies_function'
      });
    
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
