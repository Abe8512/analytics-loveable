
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

    // Direct insert to the call_transcripts table
    const { data: insertData, error } = await supabase
      .from('call_transcripts')
      .insert({
        id: data.id || undefined,
        user_id: data.user_id || 'anonymous',
        text: data.text,
        filename: data.filename || 'unnamed_recording.mp3',
        duration: data.duration || 0,
        sentiment: data.sentiment || 'neutral',
        keywords: data.keywords || [],
        call_score: data.call_score || 50,
        metadata: data.metadata || {}
      })
      .select()
    
    if (error) {
      console.error('Error inserting call transcript:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }, 
          status: 500 
        }
      )
    }
    
    // The trigger function will automatically create a corresponding call record
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Call transcript saved successfully',
        id: insertData && insertData.length > 0 ? insertData[0].id : data.id
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
