
import { supabase } from "@/integrations/supabase/client";

export const createSalesInsightsTable = async () => {
  try {
    // Check if the table exists using a more direct SQL approach
    const { error: checkError, data } = await supabase.rpc('execute_sql', { 
      query_text: "SELECT to_regclass('public.sales_insights');" 
    });
    
    // If there's an error or the table doesn't exist (null result)
    // Properly type check the response
    const tableExists = data && 
      Array.isArray(data) && 
      data.length > 0 && 
      data[0] && 
      data[0].to_regclass !== null;
    
    if (checkError || !tableExists) {
      console.log('Sales insights table does not exist, trying to create it...');
      
      // Use SQL query to create the table
      const { error: createError } = await supabase.rpc('execute_sql', {
        query_text: `
          CREATE TABLE IF NOT EXISTS public.sales_insights (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            value TEXT NOT NULL,
            change INTEGER,
            is_positive BOOLEAN DEFAULT true,
            tooltip TEXT,
            category TEXT DEFAULT 'general',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `
      });
      
      if (createError) {
        console.error('Error creating sales_insights table:', createError);
        return false;
      }
      
      // Insert demo data
      const demoInsights = [
        {
          title: 'Conversion Rate',
          value: '42%',
          change: 8,
          is_positive: true,
          tooltip: 'Percentage of calls resulting in a successful sale'
        },
        {
          title: 'Avg. Call Duration',
          value: '12.5 min',
          change: -3,
          is_positive: true,
          tooltip: 'Average length of sales calls - shorter calls can indicate improved efficiency'
        },
        {
          title: 'Daily Calls',
          value: '48',
          change: 15,
          is_positive: true,
          tooltip: 'Percentage of calls made per day'
        }
      ];
      
      // Use a safer approach to insert demo data
      for (const insight of demoInsights) {
        // Escape single quotes in string values to prevent SQL injection
        const escapedTitle = insight.title.replace(/'/g, "''");
        const escapedValue = insight.value.replace(/'/g, "''");
        const escapedTooltip = insight.tooltip.replace(/'/g, "''");
        
        const { error: insertError } = await supabase.rpc('execute_sql', {
          query_text: `
            INSERT INTO public.sales_insights 
            (title, value, change, is_positive, tooltip)
            VALUES 
            ('${escapedTitle}', '${escapedValue}', ${insight.change}, ${insight.is_positive}, '${escapedTooltip}');
          `
        });
        
        if (insertError) {
          console.error(`Error inserting demo insight '${insight.title}':`, insertError);
        }
      }
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking/creating sales_insights table:', error);
    return false;
  }
};
