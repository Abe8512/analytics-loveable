
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
    
    try {
      // Simple insert with no ON CONFLICT clause at all
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
          customer_name: data.customer_name || null,
          assigned_to: data.assigned_to || null
        })
      
      if (error) {
        console.error('Error inserting call transcript:', error)
        
        // Try a simplified insert with minimal data as last resort
        try {
          console.log('Attempting simplified insert with minimal data')
          
          const { data: minimalData, error: minimalError } = await supabase
            .from('call_transcripts')
            .insert({
              id: transcriptId,
              user_id: data.user_id || 'anonymous',
              text: cleanText || "No transcript available",
              filename: data.filename || 'unnamed_recording.mp3',
              user_name: data.user_name || null,
              customer_name: data.customer_name || null,
              assigned_to: data.assigned_to || null
            })
          
          if (minimalError) {
            console.error('Simplified insert also failed:', minimalError)
            return new Response(
              JSON.stringify({ error: minimalError.message }),
              { 
                headers: { 'Content-Type': 'application/json', ...corsHeaders }, 
                status: 500 
              }
            )
          }
          
          console.log('Simplified insert succeeded with ID:', transcriptId)
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Call transcript saved with minimal data',
              id: transcriptId
            }),
            { 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          )
        } catch (fallbackError) {
          console.error('All insert attempts failed:', fallbackError)
          return new Response(
            JSON.stringify({ error: fallbackError instanceof Error ? fallbackError.message : 'All insert attempts failed' }),
            { 
              headers: { 'Content-Type': 'application/json', ...corsHeaders }, 
              status: 500 
            }
          )
        }
      }
      
      // If we get here, try to store keywords separately in keyword_analytics table which has more relaxed permissions
      if (data.keywords && data.keywords.length > 0) {
        try {
          // Process each keyword individually
          for (const keyword of data.keywords) {
            if (!keyword) continue;
            
            await supabase
              .from('keyword_analytics')
              .insert({
                keyword,
                category: data.sentiment || 'neutral',
                last_used: new Date().toISOString()
              })
              .single();
          }
          console.log('Keywords saved to analytics table successfully');
        } catch (keywordError) {
          // Just log this error without failing the whole process
          console.error('Error saving keywords to analytics:', keywordError);
        }
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
    } catch (insertError) {
      console.error('Exception during insert:', insertError)
      return new Response(
        JSON.stringify({ error: insertError instanceof Error ? insertError.message : 'Exception during insert' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }, 
          status: 500 
        }
      )
    }
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
