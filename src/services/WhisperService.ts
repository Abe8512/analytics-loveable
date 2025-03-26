import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { errorHandler } from './ErrorHandlingService';

// Define the structure of the transcription response from Whisper
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
  sentiment?: string;
  keywords?: string[];
  filename?: string;
}

// Speech recognition fallback for browsers
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
  const [useLocalWhisper, setUseLocalWhisper] = useState(false);
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [transcriptions, setTranscriptions] = useState<StoredTranscription[]>([]);
  
  // Load transcriptions from local storage on mount
  useEffect(() => {
    loadTranscriptions();
  }, []);
  
  // Function to load transcriptions from local storage
  const loadTranscriptions = useCallback(() => {
    try {
      const stored = localStorage.getItem('transcriptions');
      setTranscriptions(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Error retrieving stored transcriptions:', error);
      errorHandler.handleError(error, 'WhisperService.loadTranscriptions');
    }
  }, []);
  
  // Function to save transcriptions to local storage
  const saveTranscriptions = useCallback((newTranscriptions: StoredTranscription[]) => {
    try {
      localStorage.setItem('transcriptions', JSON.stringify(newTranscriptions));
      setTranscriptions(newTranscriptions);
    } catch (error) {
      console.error('Error saving transcriptions to local storage:', error);
      errorHandler.handleError(error, 'WhisperService.saveTranscriptions');
    }
  }, []);
  
  // Function to add a new transcription
  const addTranscription = useCallback((newTranscription: StoredTranscription) => {
    saveTranscriptions([newTranscription, ...transcriptions]);
  }, [transcriptions, saveTranscriptions]);
  
  // Function to update an existing transcription
  const updateTranscription = useCallback((updatedTranscription: StoredTranscription) => {
    const updatedTranscriptions = transcriptions.map(transcription =>
      transcription.id === updatedTranscription.id ? updatedTranscription : transcription
    );
    saveTranscriptions(updatedTranscriptions);
  }, [transcriptions, saveTranscriptions]);
  
  // Function to delete a transcription
  const deleteTranscription = useCallback((id: string) => {
    const remainingTranscriptions = transcriptions.filter(transcription => transcription.id !== id);
    saveTranscriptions(remainingTranscriptions);
  }, [transcriptions, saveTranscriptions]);
  
  // Initialize speech recognition if available
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let interimTranscription = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscription(prevTranscription => prevTranscription + ' ' + event.results[i][0].transcript);
          } else {
            interimTranscription += event.results[i][0].transcript;
          }
        }
        if (interimTranscription) {
          setTranscription(prevTranscription => prevTranscription + ' ' + interimTranscription);
        }
      };
      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        errorHandler.handleError(event, 'WhisperService.speechRecognition.onerror');
      };
      recognition.onend = () => {
        setIsTranscribing(false);
      };
      setSpeechRecognition(recognition);
      setUseSpeechRecognition(true);
    } else {
      console.warn('Speech recognition is not supported in this browser.');
      errorHandler.handleError(new Error('Speech recognition not supported'), 'WhisperService.speechRecognition.notSupported');
      setUseSpeechRecognition(false);
    }
  }, []);
  
  // Start transcribing with browser-based speech recognition
  const startTranscription = () => {
    if (speechRecognition) {
      setTranscription('');
      setError(null);
      setIsTranscribing(true);
      speechRecognition.start();
    }
  };
  
  // Stop transcribing with browser-based speech recognition
  const stopTranscription = () => {
    if (speechRecognition) {
      setIsTranscribing(false);
      speechRecognition.stop();
    }
  };
  
  // Toggle between local and API-based Whisper
  const toggleUseLocalWhisper = () => {
    setUseLocalWhisper(prev => !prev);
  };
  
  // Set the number of speakers for diarization
  const setNumSpeakersValue = (value: number) => {
    setNumSpeakers(value);
  };
  
  // Placeholder function for transcribing audio with Whisper
  const transcribeAudio = async (file: File): Promise<WhisperTranscriptionResponse> => {
    // This is a placeholder implementation
    return {
      text: "This is a placeholder transcription.",
      segments: [
        {
          id: 1,
          start: 0,
          end: 5,
          text: "This is a placeholder transcription.",
          speaker: "Speaker 1"
        }
      ]
    };
  };
  
  const forceRefreshTranscriptions = () => {
    loadTranscriptions();
  };
  
  return {
    isTranscribing,
    transcription,
    error,
    startTranscription,
    stopTranscription,
    useSpeechRecognition,
    toggleUseLocalWhisper,
    useLocalWhisper,
    numSpeakers,
    setNumSpeakersValue,
    transcribeAudio: async (file: File): Promise<WhisperTranscriptionResponse> => {
      // This is a placeholder implementation
      return {
        text: "This is a placeholder transcription.",
        segments: [
          {
            id: 1,
            start: 0,
            end: 5,
            text: "This is a placeholder transcription.",
            speaker: "Speaker 1"
          }
        ]
      };
    },
    getUseLocalWhisper: () => useLocalWhisper,
    getNumSpeakers: () => numSpeakers,
    forceRefreshTranscriptions: () => {
      loadTranscriptions();
    },
    getStoredTranscriptions: () => {
      try {
        const stored = localStorage.getItem('transcriptions');
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error retrieving stored transcriptions:', error);
        return [];
      }
    },
    addTranscription,
    updateTranscription,
    deleteTranscription
  };
};

export const setOpenAIKey = (key: string): void => {
  localStorage.setItem('openai_api_key', key);
};

export function getStoredTranscriptions(): StoredTranscription[] {
  try {
    const stored = localStorage.getItem('transcriptions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving stored transcriptions:', error);
    return [];
  }
}
