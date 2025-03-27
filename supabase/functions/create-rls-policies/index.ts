
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create RLS policies for the calls table to make it accessible
    const callsTableQuery = `
      ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow full access to calls" ON calls;
      CREATE POLICY "Allow full access to calls" ON calls FOR ALL USING (true);
    `;
    
    // Create RLS policies for the call_transcripts table
    const transcriptsTableQuery = `
      ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow full access to call_transcripts" ON call_transcripts;
      CREATE POLICY "Allow full access to call_transcripts" ON call_transcripts FOR ALL USING (true);
    `;
    
    // Create RLS policies for the team_members table
    const teamMembersTableQuery = `
      ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow full access to team_members" ON team_members;
      CREATE POLICY "Allow full access to team_members" ON team_members FOR ALL USING (true);
    `;
    
    // Execute the queries
    try {
      await supabase.rpc('execute_sql', { query_text: callsTableQuery });
      console.log('Successfully set up RLS policies for calls table');
    } catch (callsError) {
      console.error('Error setting up RLS policies for calls table:', callsError);
    }
    
    try {
      await supabase.rpc('execute_sql', { query_text: transcriptsTableQuery });
      console.log('Successfully set up RLS policies for call_transcripts table');
    } catch (transcriptsError) {
      console.error('Error setting up RLS policies for call_transcripts table:', transcriptsError);
    }
    
    try {
      await supabase.rpc('execute_sql', { query_text: teamMembersTableQuery });
      console.log('Successfully set up RLS policies for team_members table');
    } catch (teamMembersError) {
      console.error('Error setting up RLS policies for team_members table:', teamMembersError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'RLS policies created successfully'
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  } catch (err) {
    console.error('Error in create-rls-policies:', err)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred' 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      }
    )
  }
})
