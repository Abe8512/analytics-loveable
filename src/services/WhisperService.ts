import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { errorHandler } from './ErrorHandlingService';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { getSentimentScore } from './AIService';
import { withFeedback } from '@/utils/feedbackUtils';
import LoadingState from '@/components/ui/LoadingState';

export interface WhisperTranscriptionResponse {
  text: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    speaker: string;
  }>;
  language?: string;
  duration?: number;
}

export interface StoredTranscription {
  id: string;
  text: string;
  date: string;
  duration?: number;
  speakerName?: string;
  transcript_segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    speaker: string;
  }>;
  sentiment?: "positive" | "neutral" | "negative";
  keywords?: string[];
  filename?: string;
  call_score?: number;
}

export const SUPPORTED_AUDIO_FORMATS = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/x-m4a', 'audio/ogg', 'audio/webm'];
export const MAX_AUDIO_FILE_SIZE = 20 * 1024 * 1024;

export const getOpenAIKey = () => {
  return localStorage.getItem('openai_api_key') || '';
};

export const setOpenAIKey = (key: string) => {
  localStorage.setItem('openai_api_key', key);
};

const getSpeechRecognition = () => {
  // @ts-ignore - These properties exist in modern browsers
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

export const useWhisperService = () => {
  const [useSpeechRecognition, setUseSpeechRecognition] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [useLocalWhisper, setUseLocalWhisperState] = useState(() => {
    // Initialize from localStorage if available
    const stored = localStorage.getItem('use_local_whisper');
    return stored ? stored === 'true' : false;
  });
  const [numSpeakers, setNumSpeakers] = useState(() => {
    const stored = localStorage.getItem('num_speakers');
    return stored ? parseInt(stored, 10) : 2;
  });
  
  // Toggle between local and remote Whisper
  const toggleUseLocalWhisper = useCallback(() => {
    const newValue = !useLocalWhisper;
    setUseLocalWhisperState(newValue);
    localStorage.setItem('use_local_whisper', newValue.toString());
  }, [useLocalWhisper]);
  
  // Get the current setting for local Whisper
  const getUseLocalWhisper = useCallback(() => {
    return useLocalWhisper;
  }, [useLocalWhisper]);
  
  // Set whether to use local Whisper
  const setUseLocalWhisper = useCallback((value: boolean) => {
    setUseLocalWhisperState(value);
    localStorage.setItem('use_local_whisper', value.toString());
  }, []);
  
  // Get the number of speakers
  const getNumSpeakers = useCallback(() => {
    return numSpeakers;
  }, [numSpeakers]);
  
  // Set the number of speakers
  const setNumSpeakersValue = useCallback((num: number) => {
    setNumSpeakers(num);
    localStorage.setItem('num_speakers', num.toString());
  }, []);
  
  // Initialize speech recognition if available
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (SpeechRecognition) {
      setUseSpeechRecognition(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      setSpeechRecognition(recognition);
    }
  }, []);

  const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
    // Check if the file type is supported
    if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
      return { 
        valid: false, 
        error: `Unsupported file format: ${file.type}. Supported formats: WAV, MP3, M4A, OGG, WEBM.` 
      };
    }
    
    // Check file size
    if (file.size > MAX_AUDIO_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File size exceeds maximum allowed (20MB). Current size: ${Math.round(file.size / (1024 * 1024))}MB.` 
      };
    }
    
    // File passed validation
    return { valid: true };
  };
  
  const transcribeAudio = async (
    audioFile: File, 
    onProgressUpdate?: (progress: number) => void
  ): Promise<WhisperTranscriptionResponse> => {
    try {
      setIsTranscribing(true);
      setError(null);
      
      // Validate the audio file
      const validation = validateAudioFile(audioFile);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Log info about the audio file
      console.log(`Transcribing file: ${audioFile.name}`, {
        type: audioFile.type,
        size: `${Math.round(audioFile.size / 1024)} KB`
      });
      
      let transcribedText = "";
      let segments: any[] = [];
      
      if (useLocalWhisper) {
        console.log('Using local Whisper mode (browser-based)');
        // Use browser's speech recognition (simulated for now)
        const result = await transcribeWithLocalWhisper(audioFile);
        transcribedText = result.text;
        segments = result.segments || [];
        if (onProgressUpdate) onProgressUpdate(100);
      } else {
        // Use OpenAI API
        try {
          // Try to use Supabase Edge Function first (more secure)
          console.log('Attempting to use Supabase Edge Function');
          
          // Set initial progress
          if (onProgressUpdate) onProgressUpdate(10);
          
          const edgeFunctionResult = await callSupabaseWhisperEdgeFunction(audioFile, onProgressUpdate);
          transcribedText = edgeFunctionResult.text;
          segments = edgeFunctionResult.segments || [];
          console.log('Transcription completed via Edge Function');
        } catch (edgeFuncError) {
          console.warn('Edge function failed, falling back to direct API call:', edgeFuncError);
          toast.warning('Edge function failed, falling back to direct API call');
          
          // If edge function failed and we have no API key, throw a more helpful error
          if (!getOpenAIKey()) {
            throw new Error('OpenAI API key not configured and edge function failed. Please add your API key in Settings.');
          }
          
          // Fallback to direct API call
          if (onProgressUpdate) onProgressUpdate(30);
          const directApiResult = await callOpenAIWhisperAPI(audioFile);
          transcribedText = directApiResult.text;
          segments = directApiResult.segments || [];
          if (onProgressUpdate) onProgressUpdate(90);
          console.log('Transcription completed via direct API call');
        }
        
        // If no segments were returned by the API, create them with more realistic speaker detection
        if (!segments || segments.length === 0) {
          segments = createRealisticSegments(transcribedText, numSpeakers);
        }
        
        // Final progress update
        if (onProgressUpdate) onProgressUpdate(100);
      }
      
      return {
        text: transcribedText,
        segments,
        duration: segments && segments.length > 0 ? segments[segments.length - 1].end : estimateDuration(transcribedText),
        language: 'en'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Transcription failed: ${errorMessage}`);
      errorHandler.handleError(err, 'WhisperService.transcribeAudio');
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  };
  
  const createRealisticSegments = (text: string, numSpeakers: number): any[] => {
    const segments: any[] = [];
    
    // Split text into sentences
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    // Identify potential speaker changes based on content and patterns
    let currentTime = 0;
    let currentSpeakerId = 0;
    let consecutiveSentences = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      
      // Calculate estimated duration based on word count (avg 150 words per minute)
      const wordCount = sentence.split(/\s+/).length;
      const estimatedDuration = (wordCount / 150) * 60; // in seconds
      
      // Determine when to switch speakers based on content patterns
      if (i > 0) {
        // Change speaker if:
        // 1. The sentence starts with a question mark response
        // 2. The sentence contains greeting or affirmation after a statement
        // 3. Speaker has had 3-4 consecutive sentences
        const isQuestionResponse = sentences[i-1].endsWith('?') && !sentence.endsWith('?');
        const hasGreeting = /^(yes|no|yeah|right|okay|hi|hello|thanks)/i.test(sentence);
        const longMonologue = consecutiveSentences >= 3 + Math.floor(Math.random() * 2);
        
        if (isQuestionResponse || hasGreeting || longMonologue) {
          currentSpeakerId = (currentSpeakerId + 1) % numSpeakers;
          consecutiveSentences = 0;
        } else {
          consecutiveSentences++;
        }
      }
      
      // Map speaker ID to agent/customer role
      const speakerRole = currentSpeakerId === 0 ? 'agent' : 'customer';
      
      segments.push({
        id: i + 1,
        start: currentTime,
        end: currentTime + estimatedDuration,
        text: sentence,
        speaker: speakerRole
      });
      
      // Add a small pause between segments (0.5-1.5 seconds)
      const pauseDuration = 0.5 + Math.random();
      currentTime += estimatedDuration + pauseDuration;
    }
    
    return segments;
  };
  
  const estimateDuration = (text: string): number => {
    // Average reading speed is ~150 words per minute
    const wordCount = text.split(/\s+/).length;
    return (wordCount / 150) * 60; // in seconds
  };
  
  const callSupabaseWhisperEdgeFunction = async (
    audioBlob: Blob, 
    onProgressUpdate?: (progress: number) => void
  ): Promise<WhisperTranscriptionResponse> => {
    try {
      console.log('Calling Supabase Edge Function for transcription');
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Audio = btoa(binary);
      
      // Get API key from localStorage to pass to the edge function
      const apiKey = getOpenAIKey();
      console.log('Using API key for Edge Function:', apiKey ? 'Available' : 'Not available');
      
      // Update progress - started sending to edge function
      if (onProgressUpdate) onProgressUpdate(25);
      
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          audio: base64Audio,
          userProvidedKey: apiKey, // Pass the user's API key to the edge function
          numSpeakers: numSpeakers // Pass the number of speakers for better segmentation
        }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data || !data.text) {
        console.error('No text returned from Edge Function:', data);
        throw new Error('No transcription returned from Edge Function');
      }
      
      console.log('Edge Function returned text:', data.text);
      console.log('Progress data:', data.progress);
      
      // Update progress based on response
      if (onProgressUpdate && data.progress) {
        onProgressUpdate(data.progress);
      } else if (onProgressUpdate) {
        onProgressUpdate(75); // Default progress if not provided
      }
      
      // Check if the response contains a simulated transcript
      if (data.text.includes('simulated transcript')) {
        console.warn('Edge function returned a simulated transcript');
        throw new Error('Edge function returned a simulated transcript. Check your API key configuration.');
      }
      
      return {
        text: data.text,
        segments: data.segments || [],
        duration: data.duration || estimateDuration(data.text),
        language: data.language || 'en'
      };
    } catch (error) {
      console.error('Error calling edge function:', error);
      throw error;
    }
  };
  
  const callOpenAIWhisperAPI = async (audioBlob: Blob): Promise<WhisperTranscriptionResponse> => {
    const apiKey = getOpenAIKey();
    
    if (!apiKey) {
      console.error('No OpenAI API key found in localStorage');
      throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
    }
    
    console.log('Using OpenAI API key from localStorage:', apiKey.substring(0, 3) + '...');
    
    // Create a FormData object to send the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    
    // Add speaker detection parameters if multiple speakers
    if (numSpeakers > 1) {
      formData.append('response_format', 'verbose_json');
      formData.append('temperature', '0');
      formData.append('language', 'en');
    }
    
    // Implement retry logic with exponential backoff
    let retries = 0;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    while (retries < maxRetries) {
      try {
        console.log(`API attempt ${retries + 1} of ${maxRetries}`);
        
        // Call OpenAI Whisper API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null) || await response.text().catch(() => 'Unknown error');
          console.error('OpenAI API error response:', errorData);
          
          // Don't retry for auth errors or other specific errors
          if (response.status === 401 || response.status === 403) {
            throw new Error(`OpenAI API authorization error: Please check your API key.`);
          }
          
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('OpenAI API response:', data);
        
        // Process segments if available
        let segments: any[] = [];
        if (data.segments) {
          segments = data.segments.map((seg: any) => ({
            id: seg.id,
            start: seg.start,
            end: seg.end,
            text: seg.text,
            speaker: seg.speaker || determineDefaultSpeaker(seg.id)
          }));
        }
        
        // Return the transcribed text and segments
        return {
          text: data.text,
          segments: segments,
          duration: estimateAudioDuration(data),
          language: data.language || 'en'
        };
      } catch (error) {
        console.error(`Attempt ${retries + 1} failed:`, error);
        
        // If final retry, throw the error
        if (retries === maxRetries - 1) {
          console.error('All retry attempts failed');
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, retries) + Math.random() * 1000;
        console.log(`Retrying in ${Math.round(delay / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        retries++;
      }
    }
    
    // This should never be reached due to the throw in the retry loop
    throw new Error('Failed to transcribe audio after multiple attempts');
  };
  
  const determineDefaultSpeaker = (id: number): string => {
    return id % 2 === 0 ? 'agent' : 'customer';
  };
  
  const estimateAudioDuration = (data: any): number => {
    if (data.segments && data.segments.length > 0) {
      // Use the end time of the last segment
      return data.segments[data.segments.length - 1].end;
    } else if (data.duration) {
      // Use duration if provided
      return data.duration;
    } else {
      // Estimate based on text length
      return estimateDuration(data.text);
    }
  };
  
  const transcribeWithLocalWhisper = async (audioFile: File): Promise<WhisperTranscriptionResponse> => {
    console.log('Using simulated local Whisper transcription');
    return new Promise((resolve, reject) => {
      // For demo purposes, we'll use a more descriptive simulated message
      setTimeout(() => {
        // Generate mock transcript based on filename with disclaimer
        const filename = audioFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const text = `This is a simulated OpenAI transcript for ${filename}. In a production environment, this would be the actual transcribed content from the OpenAI Whisper API.`;
        
        // Create segments with more realistic timestamps
        const segments = createRealisticSegments(text, numSpeakers);
        
        resolve({
          text,
          segments,
          duration: segments[segments.length - 1].end,
          language: 'en'
        });
      }, 1500);
    });
  };
  
  const saveTranscription = useCallback((text: string, segments?: any[]): StoredTranscription => {
    try {
      const transcriptions = getStoredTranscriptions();
      
      const newTranscription: StoredTranscription = {
        id: uuidv4(),
        text,
        date: new Date().toISOString(),
        transcript_segments: segments,
        speakerName: 'User',
        sentiment: 'neutral',
        call_score: 50
      };
      
      const updatedTranscriptions = [newTranscription, ...transcriptions];
      localStorage.setItem('whisper_transcriptions', JSON.stringify(updatedTranscriptions));
      
      return newTranscription;
    } catch (error) {
      console.error('Error saving transcription:', error);
      toast.error('Failed to save transcription');
      throw error;
    }
  }, []);
  
  const saveTranscriptionWithAnalysis = useCallback(async (
    text: string, 
    segments?: any[],
    filename?: string
  ): Promise<StoredTranscription> => {
    try {
      // Analyze the text with AI
      const { sentiment, sentimentScore, keywords, keyPhrases } = await getSentimentScore(text);
      
      // Create the transcription
      const transcriptionId = uuidv4();
      const duration = segments && segments.length > 0 
        ? segments[segments.length - 1].end 
        : estimateDuration(text);
        
      const transcription: StoredTranscription = {
        id: transcriptionId,
        text,
        date: new Date().toISOString(),
        transcript_segments: segments,
        speakerName: 'User',
        sentiment,
        keywords,
        call_score: Math.round(sentimentScore * 100),
        filename: filename || `recording_${transcriptionId.slice(0, 8)}.mp3`,
        duration
      };
      
      // Save to local storage
      const transcriptions = getStoredTranscriptions();
      const updatedTranscriptions = [transcription, ...transcriptions];
      localStorage.setItem('whisper_transcriptions', JSON.stringify(updatedTranscriptions));
      
      // Try to save to database
      let dbSaveSuccess = false;
      try {
        // Clean text to avoid Unicode escape sequence issues
        const cleanText = text.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        const { data, error } = await supabase.from('call_transcripts').insert({
          id: transcriptionId,
          user_id: 'anonymous',
          text: cleanText,
          filename: transcription.filename,
          duration: transcription.duration,
          sentiment: sentiment,
          keywords: keywords,
          key_phrases: keyPhrases,
          call_score: Math.round(sentimentScore * 100),
          transcript_segments: segments,
          metadata: {
            source: 'whisper_recording',
            created_at: new Date().toISOString(),
            synced_from_local: true
          }
        }).select('id');
        
        if (error) {
          console.error('Error saving transcript to database:', error);
          // We'll handle this in the database sync function
        } else {
          console.log('Transcript saved to database successfully:', data);
          dbSaveSuccess = true;
        }
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
        // Continue since we've saved locally
      }
      
      // If database save failed, schedule sync for later
      if (!dbSaveSuccess) {
        // Flag for sync later
        const pendingSyncs = JSON.parse(localStorage.getItem('pending_db_syncs') || '[]');
        pendingSyncs.push({
          id: transcriptionId,
          type: 'transcript',
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('pending_db_syncs', JSON.stringify(pendingSyncs));
        
        // Let the user know
        toast.warning('Saved locally. Will sync to database when connection is restored.');
      }
      
      return transcription;
    } catch (error) {
      console.error('Error saving transcription with analysis:', error);
      throw error;
    }
  }, []);
  
  const syncLocalStorageWithDatabase = useCallback(async (): Promise<boolean> => {
    try {
      const pendingSyncs = JSON.parse(localStorage.getItem('pending_db_syncs') || '[]');
      if (pendingSyncs.length === 0) {
        return true; // Nothing to sync
      }
      
      const transcriptions = getStoredTranscriptions();
      let syncSuccesses = 0;
      let syncErrors = 0;
      
      for (const pendingSync of pendingSyncs) {
        if (pendingSync.type === 'transcript') {
          const transcription = transcriptions.find(t => t.id === pendingSync.id);
          if (transcription) {
            try {
              // Clean text to avoid Unicode escape sequence issues
              const cleanText = transcription.text.replace(/\u0000/g, '')
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
              
              const { error } = await supabase.from('call_transcripts').insert({
                id: transcription.id,
                user_id: 'anonymous',
                text: cleanText,
                filename: transcription.filename,
                duration: transcription.duration,
                sentiment: transcription.sentiment,
                keywords: transcription.keywords,
                transcript_segments: transcription.transcript_segments,
                call_score: transcription.call_score,
                metadata: {
                  source: 'whisper_recording',
                  created_at: transcription.date,
                  synced_from_local: true
                }
              });
              
              if (error) {
                console.error('Error during sync:', error);
                syncErrors++;
              } else {
                syncSuccesses++;
              }
            } catch (error) {
              console.error('Exception during sync:', error);
              syncErrors++;
            }
          }
        }
      }
      
      if (syncErrors === 0) {
        // Clear pending syncs if all succeeded
        localStorage.setItem('pending_db_syncs', '[]');
        return true;
      } else {
        // Keep only the failed ones
        const remainingSyncs = pendingSyncs.slice(syncSuccesses);
        localStorage.setItem('pending_db_syncs', JSON.stringify(remainingSyncs));
        return false;
      }
    } catch (error) {
      console.error('Error in syncLocalStorageWithDatabase:', error);
      return false;
    }
  }, []);
  
  const startRealtimeTranscription = async (
    onTranscriptionUpdate: (transcript: string) => void,
    onError: (error: string) => void
  ) => {
    // Implementation for real-time transcription
    try {
      if (!navigator.mediaDevices) {
        throw new Error('Media devices not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let transcript = '';
      let mediaRecorder: MediaRecorder | null = null;
      let recordedChunks: Blob[] = [];
      
      // Create media recorder to capture audio
      mediaRecorder = new MediaRecorder(stream);
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      
      // Process chunks periodically
      const processInterval = setInterval(async () => {
        if (recordedChunks.length > 0) {
          const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
          recordedChunks = [];
          
          try {
            // Use the browser's speech recognition for real-time processing
            // as OpenAI doesn't support true streaming
            if (useSpeechRecognition && speechRecognition) {
              // Already handled by the speech recognition event
            } else if (useLocalWhisper) {
              // Simulate for now with random phrases
              const newText = generateMockTranscript();
              transcript += newText + ' ';
              onTranscriptionUpdate(transcript);
            } else {
              // For demo, we'll simulate incremental updates
              // In a production app, you'd process this with Whisper API
              const newText = generateMockTranscript();
              transcript += newText + ' ';
              onTranscriptionUpdate(transcript);
            }
          } catch (chunkError) {
            console.error('Error processing audio chunk:', chunkError);
          }
        }
      }, 3000);
      
      // Start recording
      mediaRecorder.start(1000);
      
      return {
        stop: () => {
          clearInterval(processInterval);
          if (mediaRecorder) {
            mediaRecorder.stop();
          }
          stream.getTracks().forEach(track => track.stop());
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error starting transcription';
      onError(errorMessage);
      throw error;
    }
  };
  
  const generateMockTranscript = () => {
    const phrases = [
      "I understand your concerns about the pricing.",
      "Let me explain the key features of our product.",
      "This solution will help improve your workflow.",
      "Based on your needs, I recommend the premium plan.",
      "We offer a 30-day money-back guarantee.",
      "Our support team is available 24/7.",
      "You mentioned earlier that efficiency is important.",
      "I'd be happy to schedule a follow-up call.",
      "That's an excellent question.",
      "Let me check with my team and get back to you."
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };
  
  return {
    transcribeAudio,
    saveTranscription,
    saveTranscriptionWithAnalysis,
    isTranscribing,
    transcription,
    error,
    useSpeechRecognition,
    speechRecognition,
    getOpenAIKey,
    setOpenAIKey,
    toggleUseLocalWhisper,
    getUseLocalWhisper,
    setUseLocalWhisper,
    numSpeakers,
    getNumSpeakers,
    setNumSpeakers: setNumSpeakersValue,
    startRealtimeTranscription,
    syncLocalStorageWithDatabase,
    validateAudioFile
  };
};

export const getStoredTranscriptions = (): StoredTranscription[] => {
  try {
    const stored = localStorage.getItem('whisper_transcriptions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting stored transcriptions:', error);
    return [];
  }
};

export const clearStoredTranscriptions = (): void => {
  localStorage.removeItem('whisper_transcriptions');
};
