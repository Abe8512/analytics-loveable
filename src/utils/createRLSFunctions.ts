
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates database functions needed for managing RLS policies
 */
export const createRLSFunctions = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Create function to drop development-only policies
    const dropFunctionResult = await supabase.rpc('create_drop_development_policies_function');
    
    if (dropFunctionResult.error) {
      console.error('Error creating drop_development_access_policies function:', dropFunctionResult.error);
      return {
        success: false,
        message: `Failed to create drop_development_access_policies function: ${dropFunctionResult.error.message}`
      };
    }
    
    // Create function to add authenticated user policies
    const createFunctionResult = await supabase.rpc('create_authenticated_policies_function');
    
    if (createFunctionResult.error) {
      console.error('Error creating create_authenticated_access_policies function:', createFunctionResult.error);
      return {
        success: false,
        message: `Failed to create create_authenticated_access_policies function: ${createFunctionResult.error.message}`
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
