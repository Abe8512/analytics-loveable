import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { errorHandler } from './ErrorHandlingService';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

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
    // Initialize from localStorage if available
    const stored = localStorage.getItem('num_speakers');
    return stored ? parseInt(stored, 10) : 2;
  });
  const [transcriptions, setTranscriptions] = useState<StoredTranscription[]>([]);
  
  useEffect(() => {
    loadTranscriptions();
  }, []);
  
  useEffect(() => {
    localStorage.setItem('use_local_whisper', useLocalWhisper.toString());
    localStorage.setItem('num_speakers', numSpeakers.toString());
  }, [useLocalWhisper, numSpeakers]);
  
  const loadTranscriptions = useCallback(() => {
    try {
      const stored = localStorage.getItem('transcriptions');
      setTranscriptions(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Error retrieving stored transcriptions:', error);
      errorHandler.handleError(error, 'WhisperService.loadTranscriptions');
    }
  }, []);
  
  const saveTranscriptions = useCallback((newTranscriptions: StoredTranscription[]) => {
    try {
      localStorage.setItem('transcriptions', JSON.stringify(newTranscriptions));
      setTranscriptions(newTranscriptions);
    } catch (error) {
      console.error('Error saving transcriptions to local storage:', error);
      errorHandler.handleError(error, 'WhisperService.saveTranscriptions');
    }
  }, []);
  
  const addTranscription = useCallback((newTranscription: StoredTranscription) => {
    saveTranscriptions([newTranscription, ...transcriptions]);
  }, [transcriptions, saveTranscriptions]);
  
  const updateTranscription = useCallback((updatedTranscription: StoredTranscription) => {
    const updatedTranscriptions = transcriptions.map(transcription =>
      transcription.id === updatedTranscription.id ? updatedTranscription : transcription
    );
    saveTranscriptions(updatedTranscriptions);
  }, [transcriptions, saveTranscriptions]);
  
  const deleteTranscription = useCallback((id: string) => {
    const remainingTranscriptions = transcriptions.filter(transcription => transcription.id !== id);
    saveTranscriptions(remainingTranscriptions);
  }, [transcriptions, saveTranscriptions]);
  
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
  
  const startTranscription = () => {
    if (speechRecognition) {
      setTranscription('');
      setError(null);
      setIsTranscribing(true);
      speechRecognition.start();
    }
  };
  
  const stopTranscription = () => {
    if (speechRecognition) {
      setIsTranscribing(false);
      speechRecognition.stop();
    }
  };
  
  const toggleUseLocalWhisper = () => {
    setUseLocalWhisper(prev => !prev);
  };
  
  const setUseLocalWhisperState = (value: boolean) => {
    setUseLocalWhisper(value);
  };
  
  const setNumSpeakersValue = (value: number) => {
    setNumSpeakers(value);
  };

  const saveTranscriptionToDB = async (transcription: StoredTranscription) => {
    try {
      const transcriptData = {
        id: transcription.id,
        user_id: 'anonymous',
        text: transcription.text,
        duration: transcription.duration || 0,
        sentiment: transcription.sentiment || 'neutral',
        keywords: transcription.keywords || [],
        call_score: transcription.call_score || 50,
        filename: transcription.filename || 'recording.wav',
        created_at: new Date().toISOString(),
        metadata: {}
      };
      
      const { data, error } = await supabase.functions.invoke('save-call-transcript', {
        body: { data: transcriptData }
      });
      
      if (error) {
        console.error('Error saving transcription to database:', error);
        addTranscription(transcription);
        return transcription;
      }
      
      console.log('Saved transcription to database:', data);
      
      addTranscription(transcription);
      return transcription;
    } catch (dbError) {
      console.error('Exception saving to database:', dbError);
      addTranscription(transcription);
      return transcription;
    }
  };

  const saveTranscriptionWithAnalysis = async (text: string, audioFile?: File, filename = "Recording") => {
    const id = uuidv4();
    const now = new Date();
    
    const lowerText = text.toLowerCase();
    let sentiment = "neutral";
    
    if (lowerText.includes("great") || lowerText.includes("excellent") || lowerText.includes("happy") || 
        lowerText.includes("thank") || lowerText.includes("appreciate")) {
      sentiment = "positive";
    } else if (lowerText.includes("bad") || lowerText.includes("issue") || lowerText.includes("problem") || 
               lowerText.includes("not working") || lowerText.includes("error") || lowerText.includes("disappoint")) {
      sentiment = "negative";
    }
    
    const commonWords = new Set(["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "about", "is", "are", "was", "were"]);
    const wordCounts: Record<string, number> = {};
    
    lowerText.split(/\s+/).forEach(word => {
      const cleanWord = word.replace(/[.,!?;:()"'-]/g, '');
      if (cleanWord && cleanWord.length > 3 && !commonWords.has(cleanWord)) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
    
    const keywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
    
    let callScore = 70;
    if (sentiment === "positive") {
      callScore += 15;
    } else if (sentiment === "negative") {
      callScore -= 15;
    }
    
    const sentenceRegex = /[.!?]+/;
    const sentences = text.split(sentenceRegex).filter(s => s.trim().length > 0);
    
    const transcript_segments = sentences.map((sentence, i) => {
      const duration = sentence.length / 20;
      return {
        id: i + 1,
        start: i === 0 ? 0 : 
          sentences.slice(0, i).reduce((total, s) => total + s.length / 20, 0),
        end: sentences.slice(0, i + 1).reduce((total, s) => total + s.length / 20, 0),
        text: sentence.trim() + (sentence.trim().match(sentenceRegex) ? '' : '.'),
        speaker: i % 2 === 0 ? "Agent" : "Customer"
      };
    });
    
    const duration = audioFile ? 
      await calculateAudioDuration(audioFile) : 
      transcript_segments.length > 0 ? 
        transcript_segments[transcript_segments.length - 1].end : 60;
    
    const newTranscription: StoredTranscription = {
      id,
      text,
      date: now.toISOString(),
      duration,
      sentiment,
      keywords,
      filename: filename || (audioFile ? audioFile.name : "Recording"),
      call_score: callScore,
      transcript_segments
    };
    
    try {
      await saveTranscriptionToDB(newTranscription);
    } catch (error) {
      console.error('Failed to save to database, using localStorage fallback', error);
      addTranscription(newTranscription);
    }
    
    return newTranscription;
  };
  
  const calculateAudioDuration = (audioFile: File): Promise<number> => {
    return new Promise((resolve) => {
      const audioUrl = URL.createObjectURL(audioFile);
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audioUrl);
        resolve(Math.round(duration));
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audioUrl);
        const estimatedSeconds = Math.round(audioFile.size / 32000);
        resolve(estimatedSeconds > 0 ? estimatedSeconds : 60);
      });
    });
  };
  
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
      
      const SpeechRecognition = getSpeechRecognition();
      if (!SpeechRecognition) {
        onError("Speech recognition not supported in this browser");
        return null;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          fullTranscript += finalTranscript;
          onTranscriptUpdate(fullTranscript.trim());
        }
        
        if (interimTranscript) {
          onTranscriptUpdate(fullTranscript.trim() + ' ' + interimTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        onError(`Speech recognition error: ${event.error}`);
      };
      
      recognition.start();
      
      return {
        stop: () => {
          recognition.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      };
    } catch (error) {
      console.error("Error starting recording:", error);
      onError("Failed to access microphone");
      return null;
    }
  };
  
  const transcribeAudio = async (file: File): Promise<WhisperTranscriptionResponse> => {
    try {
      setIsTranscribing(true);
      console.log(`Starting transcription for file: ${file.name} (${file.size} bytes)`);
      
      if (useLocalWhisper) {
        try {
          const { pipeline } = await import('@huggingface/transformers');
          console.log("Attempting to load transformers package...");
          console.log("Successfully loaded transformers package, now loading ASR model...");
          
          const transcriber = await pipeline(
            "automatic-speech-recognition",
            "openai/whisper-small"
          );
          
          const fileUrl = URL.createObjectURL(file);
          console.log("Created file URL for transcription:", fileUrl);
          
          console.log("Starting local transcription process...");
          const output = await transcriber(fileUrl, {
            chunk_length_s: 30,
            stride_length_s: 5,
            language: "english",
            task: "transcribe",
          });
          console.log("Completed local transcription, processing output:", output);
          
          URL.revokeObjectURL(fileUrl);
          
          let transcriptionText = '';
          if (Array.isArray(output)) {
            transcriptionText = output.map(item => {
              return typeof item === 'object' && item !== null && 'text' in item
                ? (item as { text: string }).text
                : '';
            }).join(' ');
          } else if (typeof output === 'object' && output !== null && 'text' in output) {
            transcriptionText = (output as { text: string }).text;
          }
          
          const sentences = transcriptionText.split(/(?<=[.!?])\s+/);
          const segments = sentences.map((sentence, i) => {
            const wordCount = sentence.split(/\s+/).length;
            const duration = wordCount / 5;
            const start = i === 0 ? 0 : 
              sentences.slice(0, i).reduce((total, s) => total + s.split(/\s+/).length / 5, 0);
            
            return {
              id: i + 1,
              start,
              end: start + duration,
              text: sentence,
              speaker: i % 2 === 0 ? "agent" : "customer"
            };
          });
          
          return {
            text: transcriptionText,
            segments,
            language: "en",
            duration: segments.length > 0 ? segments[segments.length - 1].end : 0
          };
        } catch (error) {
          console.error('Error using local Whisper model:', error);
          errorHandler.handleError(error, 'WhisperService.transcribeAudio.localWhisper');
          throw new Error(`Local transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        const apiKey = getOpenAIKey();
        
        if (!apiKey) {
          const error = new Error("OpenAI API key is missing. Please add it in the Settings page.");
          errorHandler.handleError(error, 'WhisperService.transcribeAudio.missingApiKey');
          throw error;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'verbose_json');
        
        if (numSpeakers > 1) {
          formData.append('prompt', 'This is a conversation between a sales agent and a customer.');
        }
        
        try {
          console.log("Calling OpenAI Whisper API with file:", file.name);
          const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`
            },
            body: formData
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            const errorMessage = `OpenAI API error (${response.status}): ${errorText}`;
            console.error(errorMessage);
            errorHandler.handleError(new Error(errorMessage), 'WhisperService.transcribeAudio.openaiAPIResponse');
            throw new Error(errorMessage);
          }
          
          const result = await response.json();
          console.log("Received successful response from OpenAI API:", result);
          
          return {
            text: result.text,
            segments: result.segments?.map((segment: any) => ({
              id: segment.id,
              start: segment.start,
              end: segment.end,
              text: segment.text,
              speaker: segment.speaker || (segment.id % 2 === 0 ? "agent" : "customer")
            })),
            language: result.language,
            duration: result.duration
          };
        } catch (error) {
          console.error('Error calling OpenAI API:', error);
          errorHandler.handleError(error, 'WhisperService.transcribeAudio.openaiAPI');
          throw error;
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
      errorHandler.handleError(error, 'WhisperService.transcribeAudio');
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  };
  
  const getOpenAIKey = (): string | null => {
    return localStorage.getItem('openai_api_key');
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
    getOpenAIKey,
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
    setUseLocalWhisper: setUseLocalWhisperState,
    setNumSpeakers: setNumSpeakersValue,
    startRealtimeTranscription,
    saveTranscriptionWithAnalysis,
    saveTranscriptionToDB
  };
};

export const setOpenAIKey = (key: string): void => {
  localStorage.setItem('openai_api_key', key);
  window.dispatchEvent(new CustomEvent('settings-updated', {
    detail: { setting: 'openai_api_key' }
  }));
};

export const getOpenAIKey = (): string | null => {
  return localStorage.getItem('openai_api_key');
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
