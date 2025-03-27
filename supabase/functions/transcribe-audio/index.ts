
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Detect audio format from binary data and validate
function validateAudioFormat(data: Uint8Array): { valid: boolean; format?: string; error?: string } {
  // Check for WAV header (RIFF)
  if (data.length > 12 && 
      data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46 && // "RIFF"
      data[8] === 0x57 && data[9] === 0x41 && data[10] === 0x56 && data[11] === 0x45) { // "WAVE"
    return { valid: true, format: 'audio/wav' };
  }
  
  // Check for MP3 header
  if (data.length > 3 &&
      ((data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) || // ID3
       (data[0] === 0xFF && (data[1] & 0xE0) === 0xE0))) { // MPEG sync
    return { valid: true, format: 'audio/mpeg' };
  }
  
  // Check for OGG header
  if (data.length > 4 && 
      data[0] === 0x4F && data[1] === 0x67 && data[2] === 0x67 && data[3] === 0x53) { // "OggS"
    return { valid: true, format: 'audio/ogg' };
  }
  
  // Check for WebM header (EBML)
  if (data.length > 4 && 
      data[0] === 0x1A && data[1] === 0x45 && data[2] === 0xDF && data[3] === 0xA3) {
    return { valid: true, format: 'audio/webm' };
  }
  
  // If we can't identify the format but have data, allow it (let OpenAI try to process)
  if (data.length > 1000) {
    return { valid: true, format: 'audio/unknown' };
  }
  
  return { 
    valid: false, 
    error: 'Unrecognized or invalid audio format. Supported formats: WAV, MP3, OGG, WebM.'
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audio, userProvidedKey, numSpeakers } = await req.json()
    
    if (!audio) {
      throw new Error('No audio data provided')
    }

    console.log('Received audio data, processing...')

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio)
    
    // Validate audio format
    const validation = validateAudioFormat(binaryAudio);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          error: validation.error, 
          status: 'error',
          progress: 0
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log(`Audio format detected: ${validation.format}`)
    
    // Get OpenAI API key from environment variable or user-provided key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || userProvidedKey
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured in Edge Function secrets and no user key provided')
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured on the server or in the request', 
          text: 'This is a simulated transcript as OpenAI API key is not configured. In a production environment, this would be the actual transcribed content from the OpenAI Whisper API.',
          status: 'error',
          progress: 0
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('API Key available:', openAIApiKey ? 'Yes (first 3 chars: ' + openAIApiKey.substring(0, 3) + '...)' : 'No')
    
    // Determine number of speakers for diarization (minimum 2)
    const speakerCount = numSpeakers && typeof numSpeakers === 'number' ? 
                         Math.max(2, Math.min(numSpeakers, 10)) : 2;
                         
    console.log(`Using speaker count: ${speakerCount}`)
    
    // Prepare form data with proper parameters
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: validation.format || 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en')
    
    // Add speaker detection parameters if more advanced speech detection is enabled
    formData.append('response_format', 'verbose_json')
    formData.append('temperature', '0')
    
    // Create abort controller to handle timeouts
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000) // 60 second timeout
    
    console.log('Sending to OpenAI...')

    try {
      // Send to OpenAI with intermediary progress updates
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: formData,
        signal: controller.signal,
      })
      
      clearTimeout(timeout)
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText)
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
  
      const result = await response.json()
      console.log('Transcription successful')
      
      // Process segments if they exist to add speaker detection
      let segments = [];
      
      if (result.segments) {
        segments = processSpeakerSegments(result.segments, speakerCount);
      } else {
        // Create segments from text if not provided
        segments = createSegmentsFromText(result.text, speakerCount);
      }
      
      const duration = result.duration || 
                      (segments.length > 0 ? segments[segments.length - 1].end : 0) ||
                      estimateDuration(result.text);
      
      return new Response(
        JSON.stringify({ 
          text: result.text,
          segments: segments,
          duration: duration,
          language: result.language || 'en',
          status: 'complete',
          progress: 100
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      clearTimeout(timeout)
      console.error('Error in OpenAI API call:', error)
      
      if (error.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            error: 'Request was aborted due to timeout', 
            status: 'error',
            progress: 0
          }),
          { 
            status: 499, // Client Closed Request
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      throw error // Pass to outer catch block
    }
  } catch (error) {
    console.error('Error in transcribe-audio function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        text: `Error occurred during transcription: ${error.message}. Please check your API key and try again.`,
        status: 'error',
        progress: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Process segments and add speaker diarization
function processSpeakerSegments(segments: any[], numSpeakers: number): any[] {
  // Sort segments by start time
  const sortedSegments = [...segments].sort((a, b) => a.start - b.start);
  
  // Initial speaker assignment
  let currentSpeaker = 0;
  const processedSegments = [];
  
  for (let i = 0; i < sortedSegments.length; i++) {
    const segment = sortedSegments[i];
    
    // Determine speaker changes based on pauses and linguistic markers
    if (i > 0) {
      const prevSegment = sortedSegments[i-1];
      const timeBetween = segment.start - prevSegment.end;
      const text = segment.text.toLowerCase();
      
      // Speaker change if:
      // 1. Long pause between segments (>1.5 seconds)
      // 2. Question followed by answer or response
      // 3. Text contains speaker change indicators
      const longPause = timeBetween > 1.5;
      const isAnswer = prevSegment.text.endsWith('?');
      const hasResponseMarker = /^(yes|no|right|okay|well|so|uh|sure|absolutely|definitely|thanks|thank)/i.test(text);
      
      if (longPause || isAnswer || hasResponseMarker) {
        currentSpeaker = (currentSpeaker + 1) % numSpeakers;
      }
    }
    
    // Map speaker ID to roles (agent and customer)
    const speakerRole = currentSpeaker === 0 ? 'agent' : 'customer';
    
    processedSegments.push({
      id: segment.id,
      start: segment.start,
      end: segment.end,
      text: segment.text,
      speaker: speakerRole
    });
  }
  
  return processedSegments;
}

// Create segments from raw text
function createSegmentsFromText(text: string, numSpeakers: number): any[] {
  const segments = [];
  
  // Split into sentences
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  // Track current state
  let currentTime = 0;
  let currentSpeaker = 0;
  let consecutiveSentences = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    
    // Calculate duration based on word count
    const wordCount = sentence.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60; // 150 words per minute
    
    // Determine when to switch speakers
    if (i > 0) {
      // Change speaker based on patterns in text
      const prevSentence = sentences[i-1];
      
      const isQuestionResponse = prevSentence.endsWith('?');
      const hasResponsePattern = /^(yes|no|right|okay|well|so|uh|sure|absolutely|definitely|thanks|thank)/i.test(sentence);
      const longMonologue = consecutiveSentences >= 3;
      
      if (isQuestionResponse || hasResponsePattern || longMonologue) {
        currentSpeaker = (currentSpeaker + 1) % numSpeakers;
        consecutiveSentences = 0;
      } else {
        consecutiveSentences++;
      }
    }
    
    // Map speaker ID to roles
    const speakerRole = currentSpeaker === 0 ? 'agent' : 'customer';
    
    segments.push({
      id: i + 1,
      start: currentTime,
      end: currentTime + estimatedDuration,
      text: sentence,
      speaker: speakerRole
    });
    
    // Add small pause between segments (0.5-1 second)
    const pauseDuration = 0.5 + Math.random() * 0.5;
    currentTime += estimatedDuration + pauseDuration;
  }
  
  return segments;
}

// Estimate duration from text
function estimateDuration(text: string): number {
  if (!text) return 0;
  
  // Average reading speed is 150 words per minute
  const wordCount = text.split(/\s+/).length;
  const minutes = wordCount / 150;
  
  // Add some variability (±10%)
  const variabilityFactor = 0.9 + Math.random() * 0.2;
  
  return minutes * 60 * variabilityFactor; // Return seconds
}
