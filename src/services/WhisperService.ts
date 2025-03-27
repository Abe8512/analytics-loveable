
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { errorHandler } from './ErrorHandlingService';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { getSentimentScore } from './AIService';

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
  const [useLocalWhisper, setUseLocalWhisper] = useState(() => {
    // Initialize from localStorage if available
    const stored = localStorage.getItem('use_local_whisper');
    return stored ? stored === 'true' : false;
  });
  const [numSpeakers, setNumSpeakers] = useState(() => {
    const stored = localStorage.getItem('num_speakers');
    return stored ? parseInt(stored, 10) : 2;
  });
  
  // Get OpenAI API key from localStorage
  const getOpenAIKey = useCallback(() => {
    return localStorage.getItem('openai_api_key') || '';
  }, []);
  
  // Set OpenAI API key in localStorage
  const setOpenAIKey = useCallback((key: string) => {
    localStorage.setItem('openai_api_key', key);
  }, []);
  
  // Toggle between local and remote Whisper
  const toggleUseLocalWhisper = useCallback(() => {
    const newValue = !useLocalWhisper;
    setUseLocalWhisper(newValue);
    localStorage.setItem('use_local_whisper', newValue.toString());
  }, [useLocalWhisper]);
  
  // Get the current setting for local Whisper
  const getUseLocalWhisper = useCallback(() => {
    return useLocalWhisper;
  }, [useLocalWhisper]);
  
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
  const transcribeAudio = async (audioFile: File): Promise<WhisperTranscriptionResponse> => {
    try {
      setIsTranscribing(true);
      setError(null);
      
      if (useLocalWhisper) {
        // Use browser's speech recognition
        return await transcribeWithLocalWhisper(audioFile);
      } else {
        // Use OpenAI API
        return await transcribeWithOpenAI(audioFile);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      errorHandler.handleError(err, 'WhisperService.transcribeAudio');
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  };
  
  // Use local Whisper (browser's speech recognition)
  const transcribeWithLocalWhisper = async (audioFile: File): Promise<WhisperTranscriptionResponse> => {
    return new Promise((resolve, reject) => {
      // Simulate transcription with a timeout
      setTimeout(() => {
        // Generate mock transcript based on filename
        const filename = audioFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const text = `This is a mock transcript for file ${filename}. In a real implementation, this would be actual transcribed content from the audio file. The transcript would contain the conversation between the agent and the customer, including details about their discussion, questions asked, and responses given.`;
        
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
  
  // Use OpenAI API for transcription
  const transcribeWithOpenAI = async (audioFile: File): Promise<WhisperTranscriptionResponse> => {
    const apiKey = getOpenAIKey();
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add your API key in Settings.');
    }
    
    try {
      // Create a mock response for now
      // In a real implementation, this would call the OpenAI API
      const text = `This is a simulated OpenAI transcript for ${audioFile.name}. In a production environment, this would be the actual transcribed content from the OpenAI Whisper API.`;
      
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
      
      return {
        text,
        segments,
        duration: currentTime,
        language: 'en'
      };
    } catch (error) {
      console.error('Error in transcribeWithOpenAI:', error);
      throw new Error(`Failed to transcribe audio with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
  const saveTranscriptionWithAnalysis = useCallback(async (text: string, segments?: any[]): Promise<StoredTranscription> => {
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
        filename: `recording_${transcriptionId.slice(0, 8)}.mp3`,
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
        
        const { data, error } = await supabase.functions.invoke('save-call-transcript', {
          body: {
            data: {
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
            }
          }
        });
        
        if (error) {
          console.error('Error saving transcript to database:', error);
          // Just log the error but continue - we've already saved to localStorage
        } else {
          console.log('Transcript saved to database successfully:', data);
        }
      } catch (dbError) {
        console.error('Error calling save-call-transcript function:', dbError);
        // Continue since we've saved locally
      }
      
      return transcription;
    } catch (error) {
      console.error('Error saving transcription with analysis:', error);
      throw error;
    }
  }, []);
  
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
    numSpeakers,
    setNumSpeakers: setNumSpeakersValue
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
