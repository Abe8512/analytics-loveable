
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Parse the request body
    const { data } = await req.json()
    
    if (!data || !data.text) {
      return new Response(
        JSON.stringify({ error: 'Missing required transcript data' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }, 
          status: 400 
        }
      )
    }

    // Use RPC function to save the call transcript (handles conflict issues)
    const { data: saveResult, error: rpcError } = await supabase.rpc(
      'save_call_transcript',
      { p_data: data }
    )
    
    if (rpcError) {
      console.error('Error using save_call_transcript RPC:', rpcError)
      
      // Fallback to direct insert
      const { data: insertData, error } = await supabase
        .from('call_transcripts')
        .insert(data)
      
      if (error) {
        console.error('Fallback insert also failed:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }, 
            status: 500 
          }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Call transcript saved successfully (fallback)',
          id: data.id
        }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Call transcript saved successfully',
        id: saveResult?.id || data.id
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  } catch (err) {
    console.error('Error in save-call-transcript:', err)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err.message || 'Unknown error occurred' 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      }
    )
  }
})
