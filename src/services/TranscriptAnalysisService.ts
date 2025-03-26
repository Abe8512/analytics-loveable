import { CallTranscript } from '@/types/call';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { errorHandler } from './ErrorHandlingService';
import { animationUtils } from '@/utils/animationUtils';
import { useDebounce } from '@/hooks/useDebounce';

interface TranscriptSegment {
  start: number;
  end: number;
  speaker: string;
  text: string;
}

export interface TranscriptAnalysisResult {
  id: string;
  keywords: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  key_moments: {
    timestamp: number;
    text: string;
    type: 'question' | 'objection' | 'interest' | 'action_item';
  }[];
}

export interface AnalysisOptions {
  transcriptId?: string;
  generateSummary?: boolean;
  detectKeyMoments?: boolean;
  calculateMetrics?: boolean;
}

// Mock function to simulate analysis, replace with actual ML processing
const analyzeText = (text: string): Partial<TranscriptAnalysisResult> => {
  // Placeholder for actual NLP analysis
  return {
    keywords: ['pricing', 'features', 'support', 'timeline'],
    entities: ['product X', 'company Y'],
    sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.4 ? 'neutral' : 'negative',
    summary: 'This is a summary of the conversation discussing product features and pricing.',
    key_moments: [
      {
        timestamp: 120,
        text: 'What features are included in the premium plan?',
        type: 'question',
      },
    ],
  } as Partial<TranscriptAnalysisResult>;
};

export const useTranscriptAnalysis = (options?: AnalysisOptions) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Partial<TranscriptAnalysisResult> | null>(null);
  const [transcript, setTranscript] = useState<CallTranscript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const debouncedOptions = useDebounce(options, 300);

  const calculateSpeakingTime = useCallback((segments?: TranscriptSegment[] | null) => {
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return { agent: 0, customer: 0, total: 0 };
    }

    let agentTime = 0;
    let customerTime = 0;

    segments.forEach((segment) => {
      if (segment.speaker === 'agent') {
        agentTime += segment.end - segment.start;
      } else if (segment.speaker === 'customer') {
        customerTime += segment.end - segment.start;
      }
    });

    return {
      agent: agentTime,
      customer: customerTime,
      total: agentTime + customerTime,
    };
  }, []);

  const analyzeTranscript = useCallback(
    async (transcriptId?: string) => {
      if (!transcriptId) {
        return;
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('call_transcripts')
          .select('*')
          .eq('id', transcriptId)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Transcript not found');
        }

        // Ensure the data from Supabase is cast to the right type
        const typedTranscript: CallTranscript = {
          ...data,
          sentiment: validateSentiment(data.sentiment),
          keywords: data.keywords || [],
          id: data.id,
          call_id: data.call_id,
          text: data.text,
          created_at: data.created_at
        };

        setTranscript(typedTranscript);

        // Perform analysis on the transcript text
        const analysisResults = analyzeText(data.text);
        
        // Update with analysis results
        setAnalysisResult({
          id: data.id,
          ...analysisResults,
        });

        toast({
          title: 'Analysis Complete',
          description: 'Transcript has been analyzed successfully.',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
        errorHandler.handleError(
          {
            message: 'Analysis failed',
            technical: message,
            severity: 'error',
            code: 'ANALYSIS_ERROR',
          },
          'TranscriptAnalysis'
        );

        toast({
          title: 'Analysis Failed',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (debouncedOptions?.transcriptId) {
      analyzeTranscript(debouncedOptions.transcriptId);
    }
  }, [debouncedOptions, analyzeTranscript]);

  return {
    isAnalyzing,
    analysisResult,
    transcript,
    error,
    analyzeTranscript,
    calculateSpeakingTime,
  };
};

// Function to validate sentiment values
function validateSentiment(sentiment: string): "positive" | "neutral" | "negative" {
  if (sentiment?.toLowerCase() === 'positive') return 'positive';
  if (sentiment?.toLowerCase() === 'negative') return 'negative';
  return 'neutral';
}

// Add a class implementation of TranscriptAnalysisService
export class TranscriptAnalysisService {
  // Split transcript by speaker
  public splitBySpeaker(text: string, segments: any[], numSpeakers: number): TranscriptSegment[] {
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return [];
    }
    
    // Simple algorithm to assign speakers based on alternating patterns
    return segments.map((segment, index) => {
      const speakerIndex = index % numSpeakers;
      const speaker = speakerIndex === 0 ? 'agent' : 'customer';
      
      return {
        start: segment.start || 0,
        end: segment.end || 0, 
        speaker,
        text: segment.text || ''
      };
    });
  }
  
  // Analyze sentiment with basic rules
  public analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    if (!text) return 'neutral';
    
    const positiveWords = ['great', 'excellent', 'good', 'happy', 'pleased', 'thank', 'appreciate'];
    const negativeWords = ['bad', 'issue', 'problem', 'unhappy', 'disappointed', 'sorry', 'fail'];
    
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveScore += matches.length;
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeScore += matches.length;
    });
    
    if (positiveScore > negativeScore + 2) return 'positive';
    if (negativeScore > positiveScore + 1) return 'negative';
    return 'neutral';
  }
  
  // Extract keywords with basic approach
  public extractKeywords(text: string): string[] {
    if (!text) return [];
    
    const stopWords = ['the', 'and', 'a', 'to', 'of', 'is', 'in', 'that', 'it', 'with', 'for', 'as', 'was', 'on'];
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    
    // Count word frequency
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      if (!stopWords.includes(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    // Sort by frequency
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }
  
  // Generate a basic call score
  public generateCallScore(text: string, sentiment: string): number {
    if (!text) return 50;
    
    let baseScore = 50;
    
    // Adjust based on sentiment
    if (sentiment === 'positive') baseScore += 20;
    if (sentiment === 'negative') baseScore -= 15;
    
    // Adjust based on text length (assuming longer calls are more detailed)
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 500) baseScore += 10;
    if (wordCount < 100) baseScore -= 10;
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, baseScore));
  }
}

// Export an instance to be used across the application
export const transcriptAnalysisService = new TranscriptAnalysisService();
