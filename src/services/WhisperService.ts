
// Basic Whisper Service implementation for demonstration
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from './ErrorHandlingService';
import { useEventsStore } from './EventsService';

export interface StoredTranscription {
  id: string;
  text: string;
  date: string;
  duration?: number;
  callScore?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  speakerName?: string;
  transcript_segments?: Array<{
    id: string;
    text: string;
    start: number;
    end: number;
    speaker: string;
  }>;
}

const LOCAL_STORAGE_KEY = 'whisper_transcriptions';

// Get stored transcriptions from localStorage
export const getStoredTranscriptions = (): StoredTranscription[] => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error parsing stored transcriptions:', error);
  }
  
  return [];
};

// Save transcription to localStorage
export const saveTranscription = (transcription: StoredTranscription): void => {
  try {
    const existingTranscriptions = getStoredTranscriptions();
    const updatedTranscriptions = [transcription, ...existingTranscriptions];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTranscriptions));
    
    // Dispatch event for real-time updates
    const dispatchEvent = useEventsStore.getState().dispatchEvent;
    dispatchEvent('transcript-created', { id: transcription.id });
    
    // Trigger DOM event for broader compatibility
    window.dispatchEvent(new CustomEvent('transcriptions-updated'));
  } catch (error) {
    console.error('Error saving transcription:', error);
    errorHandler.handleError({
      message: 'Failed to save transcription',
      technical: error instanceof Error ? error.message : String(error),
      severity: 'error',
      code: 'TRANSCRIPTION_SAVE_ERROR'
    });
  }
};

// Get a specific transcription by ID
export const getTranscriptionById = (id: string): StoredTranscription | null => {
  const transcriptions = getStoredTranscriptions();
  return transcriptions.find(t => t.id === id) || null;
};

// Simulates transcribing audio and returns a transcription
export const transcribeAudio = async (
  audioBlob: Blob, 
  options?: { speakerName?: string }
): Promise<StoredTranscription> => {
  // In a real app, we would upload to a Whisper API endpoint
  // This is a simulation for demo purposes
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const transcription: StoredTranscription = {
        id: uuidv4(),
        text: 'This is a simulated transcription from the Whisper service. In a real implementation, this would contain the actual transcribed text from the audio file.',
        date: new Date().toISOString(),
        duration: Math.floor(Math.random() * 300) + 60, // Random duration between 1-6 minutes
        callScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        sentiment: Math.random() > 0.7 ? 'positive' : (Math.random() > 0.4 ? 'neutral' : 'negative'),
        speakerName: options?.speakerName || 'Unknown Speaker',
        // Generate some random segments
        transcript_segments: [
          {
            id: '1',
            text: 'Hello, thank you for calling our support line. How can I help you today?',
            start: 0,
            end: 5.2,
            speaker: 'Agent'
          },
          {
            id: '2',
            text: 'Hi, I\'m having an issue with my subscription. It seems to be charging me twice.',
            start: 5.5,
            end: 12.1,
            speaker: 'Customer'
          },
          {
            id: '3',
            text: 'I understand that can be frustrating. Let me look into that for you right away.',
            start: 12.5,
            end: 17.3,
            speaker: 'Agent'
          }
        ]
      };
      
      // Save the transcription to localStorage
      saveTranscription(transcription);
      
      resolve(transcription);
    }, 2000); // Simulate processing time
  });
};

// Type for speech recognition options
interface SpeechRecognitionOptions {
  continuous?: boolean;
  language?: string;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

// Simplified speech-to-text using Web Speech API 
export const useSpeechRecognition = (options: SpeechRecognitionOptions = {}) => {
  let recognition: any = null;
  
  const isSupported = (): boolean => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };
  
  const start = () => {
    if (!isSupported()) {
      options.onError?.({ message: 'Speech recognition not supported in this browser' });
      return false;
    }
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      
      recognition.continuous = options.continuous ?? true;
      recognition.interimResults = options.interimResults ?? true;
      recognition.lang = options.language ?? 'en-US';
      
      recognition.onresult = (event: any) => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        const isFinal = event.results[resultIndex].isFinal;
        
        options.onResult?.(transcript, isFinal);
      };
      
      recognition.onerror = (event: any) => {
        options.onError?.(event);
      };
      
      recognition.onend = () => {
        options.onEnd?.();
      };
      
      recognition.start();
      return true;
    } catch (error) {
      options.onError?.(error);
      return false;
    }
  };
  
  const stop = () => {
    if (recognition) {
      recognition.stop();
    }
  };
  
  return {
    isSupported,
    start,
    stop
  };
};
