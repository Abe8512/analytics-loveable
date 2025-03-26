
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { errorHandler } from './ErrorHandlingService';
import { v4 as uuidv4 } from 'uuid';

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
  call_score?: number;
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
  
  // Set local Whisper state 
  const setUseLocalWhisperState = (value: boolean) => {
    setUseLocalWhisper(value);
  };
  
  // Set the number of speakers for diarization
  const setNumSpeakersValue = (value: number) => {
    setNumSpeakers(value);
  };

  // Save transcription with analysis
  const saveTranscriptionWithAnalysis = async (text: string, audioFile?: File, filename = "Recording") => {
    const id = uuidv4();
    const now = new Date();
    
    // Generate a simple sentiment based on text content
    let sentiment = "neutral";
    const lowerText = text.toLowerCase();
    if (lowerText.includes("great") || lowerText.includes("excellent") || lowerText.includes("happy")) {
      sentiment = "positive";
    } else if (lowerText.includes("bad") || lowerText.includes("issue") || lowerText.includes("problem")) {
      sentiment = "negative";
    }
    
    // Extract simple keywords
    const keywords = ["sales", "product", "price", "feature", "support"].filter(
      keyword => lowerText.includes(keyword)
    );
    
    // Calculate a simple call score (0-100)
    const callScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100 for demo
    
    const newTranscription: StoredTranscription = {
      id,
      text,
      date: now.toISOString(),
      duration: audioFile ? 120 : 60, // Mock duration
      sentiment,
      keywords,
      filename: filename || (audioFile ? audioFile.name : "Recording"),
      call_score: callScore, 
      transcript_segments: text.split('. ').map((sentence, i) => ({
        id: i + 1,
        start: i * 10,
        end: (i + 1) * 10,
        text: sentence + '.',
        speaker: i % 2 === 0 ? "Agent" : "Customer"
      }))
    };
    
    addTranscription(newTranscription);
    
    return newTranscription;
  };
  
  // Start realtime transcription
  const startRealtimeTranscription = async (
    onTranscriptUpdate: (text: string) => void,
    onError: (error: string) => void
  ) => {
    if (!navigator.mediaDevices) {
      onError("Media devices not supported in this browser");
      return null;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let fullTranscript = "";
      
      const mockTranscriptionUpdate = () => {
        const sentences = [
          "Hello, this is a sales call.",
          "I'm interested in your product.",
          "Can you tell me more about the pricing?",
          "We offer competitive pricing based on your needs.",
          "What features are included?",
          "Our product includes all the features you need.",
          "How does it compare to competitors?",
          "We offer better value and more features.",
        ];
        
        // Add a new sentence every 3 seconds
        let currentIndex = 0;
        
        const intervalId = setInterval(() => {
          if (currentIndex < sentences.length) {
            fullTranscript += " " + sentences[currentIndex];
            onTranscriptUpdate(fullTranscript.trim());
            currentIndex++;
          } else {
            clearInterval(intervalId);
          }
        }, 3000);
        
        return {
          stop: () => {
            clearInterval(intervalId);
            stream.getTracks().forEach(track => track.stop());
          }
        };
      };
      
      return mockTranscriptionUpdate();
    } catch (error) {
      console.error("Error starting recording:", error);
      onError("Failed to access microphone");
      return null;
    }
  };
  
  const transcribeAudio = async (file: File): Promise<WhisperTranscriptionResponse> => {
    try {
      // This is a mock implementation that returns predefined transcription
      const demoText = "Hello, this is a demo transcription. Thank you for calling our company. How can I help you today? I'm interested in learning more about your product offerings. Can you tell me about your pricing plans? Of course, we have several pricing tiers designed to meet different customer needs. Our basic plan starts at $29 per month and includes all core features. For enterprise clients, we offer custom solutions with dedicated support.";
      
      // Simulate a delay to mimic processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock segments with alternating speakers
      const segments = demoText.split('. ').map((sentence, i) => ({
        id: i + 1,
        start: i * 10,
        end: (i + 1) * 10,
        text: sentence + (sentence.endsWith('.') ? '' : '.'),
        speaker: i % 2 === 0 ? "Speaker 1" : "Speaker 2"
      }));
      
      // Return mock response
      return {
        text: demoText,
        segments,
        language: "en",
        duration: 120 // 2 minutes in seconds
      };
    } catch (error) {
      console.error('Transcription error:', error);
      errorHandler.handleError(error, 'WhisperService.transcribeAudio');
      throw new Error('Failed to transcribe audio');
    }
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
    transcribeAudio,
    getUseLocalWhisper: () => useLocalWhisper,
    getNumSpeakers: () => numSpeakers,
    forceRefreshTranscriptions,
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
    deleteTranscription,
    // Add the new methods
    setUseLocalWhisper: setUseLocalWhisperState,
    setNumSpeakers: setNumSpeakersValue,
    startRealtimeTranscription,
    saveTranscriptionWithAnalysis
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
