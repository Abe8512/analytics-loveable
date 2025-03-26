
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Set up CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Create a Supabase client with the project details
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Handle non-POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Parse the request body
    const callData = await req.json()
    console.log('Received call data:', callData)

    // Validate the required fields
    if (!callData.id) {
      throw new Error('Missing required field: id')
    }

    // Check if the ID is a valid UUID
    try {
      // Simple UUID validation using regex
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(callData.id)) {
        throw new Error(`Invalid UUID format: ${callData.id}`)
      }
    } catch (error) {
      console.error('UUID validation error:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid UUID format',
          error: error.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use the new database function to save the call without returning data
    // This avoids the DISTINCT ORDER BY error entirely
    const { data, error } = await supabase.rpc('save_call', {
      p_data: callData
    })

    // Log any errors but still return success to the client
    if (error) {
      console.error('Error inserting call:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Call data received but failed to insert',
          error: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Call data inserted successfully',
        id: callData.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    // Log the error but return a success response to prevent client timeouts
    console.error('Error handling request:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error processing request',
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
