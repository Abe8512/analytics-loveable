
import { CallTranscript } from './CallTranscriptService';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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

        setTranscript(data);

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
