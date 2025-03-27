import { supabase } from '@/integrations/supabase/client';
import { SentimentAnalysisService } from './SentimentAnalysisService';
import type { Json } from '@/integrations/supabase/types';

export interface TranscriptAnalysisResult {
  sentimentScore: number;
  keyPhrases: string[];
  keywordFrequency: Record<string, number>;
  callDuration: number;
  speakerRatio: {
    agent: number;
    customer: number;
  };
  topics: string[];
}

export interface SpeakerTurn {
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface AnalyzedTranscript {
  id: string;
  call_id: string;
  turns: SpeakerTurn[];
  analysis: TranscriptAnalysisResult;
  created_at: string;
  updated_at: string;
}

export class TranscriptAnalysisService {
  async analyzeTranscript(transcriptId: string): Promise<TranscriptAnalysisResult | null> {
    try {
      const { data: transcript, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('id', transcriptId)
        .single();

      if (error || !transcript) {
        console.error('Error fetching transcript:', error);
        return null;
      }

      let turns: SpeakerTurn[] = [];
      if (transcript.transcript_segments) {
        try {
          const segments = typeof transcript.transcript_segments === 'string' 
            ? JSON.parse(transcript.transcript_segments) 
            : transcript.transcript_segments;
            
          if (Array.isArray(segments)) {
            turns = segments.map(segment => {
              return {
                speaker: typeof segment.speaker === 'string' && 
                  (segment.speaker === 'agent' || segment.speaker === 'customer') 
                  ? segment.speaker : 'agent',
                text: typeof segment.text === 'string' ? segment.text : '',
                timestamp: typeof segment.timestamp === 'string' ? segment.timestamp : new Date().toISOString()
              };
            });
          }
        } catch (e) {
          console.error('Error parsing transcript segments:', e);
        }
      }
      
      const analyzedTurns = turns.map(turn => ({
        ...turn,
        sentiment: SentimentAnalysisService.analyzeSentiment(turn.text)
      }));

      const sentiments = analyzedTurns.map(t => 
        t.sentiment === 'positive' ? 1 : 
        t.sentiment === 'negative' ? -1 : 0
      );
      
      const sentimentScore = sentiments.length > 0 
        ? sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length
        : 0;

      const keyPhrases = this.extractKeyPhrases(transcript.text);

      const keywordFrequency = this.calculateKeywordFrequency(transcript.text);

      const agentWords = turns
        .filter(t => t.speaker === 'agent')
        .reduce((count, turn) => count + turn.text.split(/\s+/).length, 0);
      
      const customerWords = turns
        .filter(t => t.speaker === 'customer')
        .reduce((count, turn) => count + turn.text.split(/\s+/).length, 0);
      
      const totalWords = agentWords + customerWords;
      
      const speakerRatio = {
        agent: totalWords > 0 ? agentWords / totalWords : 0.5,
        customer: totalWords > 0 ? customerWords / totalWords : 0.5
      };

      let callDuration = 0;
      if (turns.length > 0 && turns[0].timestamp && turns[turns.length - 1].timestamp) {
        const startTime = new Date(turns[0].timestamp).getTime();
        const endTime = new Date(turns[turns.length - 1].timestamp).getTime();
        callDuration = (endTime - startTime) / 1000;
      }

      const topics = this.identifyTopics(keyPhrases, keywordFrequency);

      const analysisResult: TranscriptAnalysisResult = {
        sentimentScore,
        keyPhrases,
        keywordFrequency,
        callDuration,
        speakerRatio,
        topics
      };

      await this.saveAnalysisResults(transcriptId, analysisResult, analyzedTurns);

      return analysisResult;
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      return null;
    }
  }

  private async saveAnalysisResults(
    transcriptId: string, 
    analysis: TranscriptAnalysisResult,
    analyzedTurns: SpeakerTurn[]
  ): Promise<void> {
    try {
      const callScore = typeof analysis.sentimentScore === 'number' 
        ? Math.round(analysis.sentimentScore * 100) 
        : 50;
        
      const { error } = await supabase
        .from('call_transcripts')
        .update({
          call_score: callScore,
          key_phrases: analysis.keyPhrases,
          keywords: Object.keys(analysis.keywordFrequency).slice(0, 10),
          transcript_segments: JSON.stringify(analyzedTurns),
          metadata: {
            ...analysis,
            analyzed_at: new Date().toISOString()
          }
        })
        .eq('id', transcriptId);

      if (error) {
        console.error('Error saving analysis results:', error);
      }
    } catch (error) {
      console.error('Error in saveAnalysisResults:', error);
    }
  }

  private extractKeyPhrases(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return [];
    }
    
    const phrases = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      if (words.length >= 3 && words.length <= 10) {
        const firstWord = words[0].toLowerCase();
        if (!['the', 'a', 'an', 'and', 'but', 'or', 'so', 'because', 'if', 'when'].includes(firstWord)) {
          phrases.push(sentence.trim());
        }
      }
    }
    
    return phrases.slice(0, 5);
  }

  private calculateKeywordFrequency(text: string): Record<string, number> {
    if (!text || typeof text !== 'string') {
      return {};
    }
    
    const frequency: Record<string, number> = {};
    const stopWords = ['the', 'a', 'an', 'and', 'but', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'is', 'are', 'was', 'were'];
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    for (const word of words) {
      if (word.length > 2 && !stopWords.includes(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    }
    
    const sortedWords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return Object.fromEntries(sortedWords);
  }

  private identifyTopics(keyPhrases: string[], keywordFrequency: Record<string, number>): string[] {
    const topics = Object.keys(keywordFrequency).slice(0, 5);
    
    for (const phrase of keyPhrases) {
      const simplified = phrase.toLowerCase().replace(/[^a-z0-9 ]/g, '');
      if (!topics.some(topic => simplified.includes(topic))) {
        topics.push(phrase);
      }
      if (topics.length >= 8) break;
    }
    
    return topics.slice(0, 8);
  }

  splitBySpeaker(text: string, segments: any[], numSpeakers: number): SpeakerTurn[] {
    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const turns: SpeakerTurn[] = [];
      
      for (let i = 0; i < sentences.length; i++) {
        const speaker = i % 2 === 0 ? 'agent' : 'customer';
        turns.push({
          speaker,
          text: sentences[i].trim(),
          timestamp: new Date(Date.now() + i * 10000).toISOString(),
          sentiment: SentimentAnalysisService.analyzeSentiment(sentences[i])
        });
      }
      
      return turns;
    } catch (error) {
      console.error('Error splitting text by speaker:', error);
      return [];
    }
  }

  extractKeywords(text: string): string[] {
    const frequency = this.calculateKeywordFrequency(text);
    return Object.keys(frequency).slice(0, 10);
  }

  analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    return SentimentAnalysisService.analyzeSentiment(text);
  }

  generateCallScore(text: string, sentiment: string): number {
    const baseScore = 
      sentiment === 'positive' ? 75 : 
      sentiment === 'negative' ? 25 : 50;
    
    const lengthFactor = Math.min(Math.max(text.length / 1000, 0), 1);
    const lengthBonus = 25 * lengthFactor;
    
    return Math.round(baseScore + lengthBonus);
  }
}

export const transcriptAnalysisService = new TranscriptAnalysisService();
