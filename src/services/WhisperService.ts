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

// Helper functions outside the hook for direct import
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
  
  // Transcribe audio from a file
  const transcribeAudio = async (
    audioFile: File, 
    onProgressUpdate?: (progress: number) => void
  ): Promise<WhisperTranscriptionResponse> => {
    try {
      setIsTranscribing(true);
      setError(null);
      
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
        return await transcribeWithLocalWhisper(audioFile);
      } else {
        // Use OpenAI API
        try {
          // Try to use Supabase Edge Function first (more secure)
          console.log('Attempting to use Supabase Edge Function');
          
          // Set initial progress
          if (onProgressUpdate) onProgressUpdate(10);
          
          transcribedText = await callSupabaseWhisperEdgeFunction(audioFile, onProgressUpdate);
          console.log('Transcription completed via Edge Function');
        } catch (edgeFuncError) {
          console.warn('Edge function failed, falling back to direct API call:', edgeFuncError);
          toast.warning('Edge function failed, falling back to direct API call');
          
          // Fallback to direct API call
          if (onProgressUpdate) onProgressUpdate(30);
          transcribedText = await callOpenAIWhisperAPI(audioFile);
          if (onProgressUpdate) onProgressUpdate(90);
          console.log('Transcription completed via direct API call');
        }
        
        // Create basic segments based on sentences
        const sentences = transcribedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let currentTime = 0;
        
        for (let i = 0; i < sentences.length; i++) {
          // Estimate duration based on word count (avg 150 words per minute)
          const wordCount = sentences[i].split(/\s+/).length;
          const estimatedDuration = (wordCount / 150) * 60; // in seconds
          
          segments.push({
            id: i + 1,
            start: currentTime,
            end: currentTime + estimatedDuration,
            text: sentences[i].trim() + '.',
            speaker: i % 2 === 0 ? 'agent' : 'customer'
          });
          
          currentTime += estimatedDuration;
        }
        
        // Final progress update
        if (onProgressUpdate) onProgressUpdate(100);
        
        return {
          text: transcribedText,
          segments,
          duration: currentTime,
          language: 'en'
        };
      }
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
  
  // Process audio with Supabase Edge Function if available
  const callSupabaseWhisperEdgeFunction = async (
    audioBlob: Blob, 
    onProgressUpdate?: (progress: number) => void
  ): Promise<string> => {
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
          userProvidedKey: apiKey // Pass the user's API key to the edge function
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
      
      return data.text;
    } catch (error) {
      console.error('Error calling edge function:', error);
      throw error;
    }
  };
  
  // Transcribe audio from a file using OpenAI API directly
  const callOpenAIWhisperAPI = async (audioBlob: Blob): Promise<string> => {
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
    
    if (numSpeakers > 1) {
      formData.append('response_format', 'verbose_json');
      formData.append('temperature', '0');
      formData.append('language', 'en');
    }
    
    // Call OpenAI Whisper API
    try {
      console.log('Calling OpenAI API directly with key:', apiKey.substring(0, 3) + '...');
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('OpenAI API error response:', errorData || errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData ? JSON.stringify(errorData) : errorText}`);
      }
      
      const data = await response.json();
      console.log('OpenAI API response:', data);
      
      // Return the transcribed text
      if (typeof data === 'object' && data.text) {
        return data.text;
      } else {
        return String(data);
      }
    } catch (error) {
      console.error('Error calling OpenAI Whisper API:', error);
      toast.error(`Error calling OpenAI API: ${error.message}`);
      throw error;
    }
  };
  
  // Use local Whisper (browser's speech recognition)
  const transcribeWithLocalWhisper = async (audioFile: File): Promise<WhisperTranscriptionResponse> => {
    console.log('Using simulated local Whisper transcription');
    return new Promise((resolve, reject) => {
      // For demo purposes, we'll use a more descriptive simulated message
      setTimeout(() => {
        // Generate mock transcript based on filename with disclaimer
        const filename = audioFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const text = `This is a simulated OpenAI transcript for ${filename}.wav. In a production environment, this would be the actual transcribed content from the OpenAI Whisper API.`;
        
        // Create segments with mock timestamps
        const segments = [];
        const sentences = text.split('.');
        let currentTime = 0;
        
        for (let i = 0; i < sentences.length; i++) {
          if (sentences[i].trim()) {
            const duration = 2 + Math.random() * 3; // Random duration between 2-5 seconds
            const speaker = i % 2 === 0 ? 'agent' : 'customer';
            
            segments.push({
              id: i + 1,
              start: currentTime,
              end: currentTime + duration,
              text: sentences[i].trim() + '.',
              speaker
            });
            
            currentTime += duration;
          }
        }
        
        resolve({
          text,
          segments,
          duration: currentTime,
          language: 'en'
        });
      }, 1500);
    });
  };
  
  // Save transcription to local storage
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
  
  // Save transcription with AI analysis
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
        duration: segments ? segments[segments.length - 1].end : 60
      };
      
      // Save to local storage
      const transcriptions = getStoredTranscriptions();
      const updatedTranscriptions = [transcription, ...transcriptions];
      localStorage.setItem('whisper_transcriptions', JSON.stringify(updatedTranscriptions));
      
      // Try to save to database
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
          metadata: {
            source: 'whisper_recording',
            created_at: new Date().toISOString(),
            segments_count: segments ? segments.length : 0
          }
        }).select('id');
        
        if (error) {
          console.error('Error saving transcript to database:', error);
          // Just log the error but continue - we've already saved to localStorage
        } else {
          console.log('Transcript saved to database successfully:', data);
        }
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
        // Continue since we've saved locally
      }
      
      return transcription;
    } catch (error) {
      console.error('Error saving transcription with analysis:', error);
      throw error;
    }
  }, []);
  
  // Real-time transcription
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
  
  // Helper for mock real-time transcription
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
    startRealtimeTranscription
  };
};

// Get transcriptions from local storage
export const getStoredTranscriptions = (): StoredTranscription[] => {
  try {
    const stored = localStorage.getItem('whisper_transcriptions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting stored transcriptions:', error);
    return [];
  }
};

// Clear all transcriptions from local storage
export const clearStoredTranscriptions = (): void => {
  localStorage.removeItem('whisper_transcriptions');
};
