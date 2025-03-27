
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
    const requestData = await req.json()
    const data = requestData.data || requestData.transcript || {}
    
    if (!data || !data.text) {
      console.error('Missing required transcript data:', JSON.stringify(requestData))
      return new Response(
        JSON.stringify({ error: 'Missing required transcript data' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }, 
          status: 400 
        }
      )
    }

    // Clean up text to prevent Unicode escape sequence issues
    const cleanText = data.text.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    
    console.log('Processing call transcript data:', {
      id: data.id || 'auto-generated',
      user_id: data.user_id || 'anonymous',
      filename: data.filename || 'unnamed_recording.mp3',
      text_length: cleanText ? cleanText.length : 0
    })

    // Process sentiment value to ensure it's one of the allowed values
    let sentiment = data.sentiment || 'neutral'
    if (!['positive', 'negative', 'neutral'].includes(sentiment)) {
      sentiment = 'neutral'
    }

    // Ensure numeric values are properly converted
    const duration = typeof data.duration === 'number' ? data.duration : 0
    const callScore = typeof data.call_score === 'number' ? data.call_score : 50

    // Generate a unique ID if not provided
    const transcriptId = data.id || crypto.randomUUID()
    
    // Simple insert - no ON CONFLICT clause
    const { data: insertData, error } = await supabase
      .from('call_transcripts')
      .insert({
        id: transcriptId,
        user_id: data.user_id || 'anonymous',
        text: cleanText,
        filename: data.filename || 'unnamed_recording.mp3',
        duration: duration,
        sentiment: sentiment,
        keywords: data.keywords || [],
        key_phrases: data.key_phrases || [],
        call_score: callScore,
        metadata: data.metadata || {},
        user_name: data.user_name || null,
        customer_name: data.customer_name || null
      })
    
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
    
    console.log('Call transcript saved successfully, ID:', transcriptId)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Call transcript saved successfully',
        id: transcriptId
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
        error: err instanceof Error ? err.message : 'Unknown error occurred' 
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      }
    )
  }
})
