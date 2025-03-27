
import { supabase } from "@/integrations/supabase/client";

export const createSalesInsightsTable = async () => {
  try {
    // Check if the table exists
    const { error: checkError } = await supabase
      .from('sales_insights')
      .select('id')
      .limit(1);
    
    // If the query returns a specific error about relation not existing, create the table
    if (checkError && checkError.message.includes('relation "sales_insights" does not exist')) {
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
      
      // Insert some demo data
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
          tooltip: 'Number of calls made per day'
        }
      ];
      
      const { error: insertError } = await supabase
        .from('sales_insights')
        .insert(demoInsights);
      
      if (insertError) {
        console.error('Error inserting demo sales insights:', insertError);
      }
      
      return !insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking/creating sales_insights table:', error);
    return false;
  }
};
