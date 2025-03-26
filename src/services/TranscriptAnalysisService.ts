
import { supabase } from '@/integrations/supabase/client';
import { SentimentAnalysisService } from './SentimentAnalysisService';

// Interfaces for the transcript analysis results
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

// Create a TranscriptAnalysisService class with all required methods
export class TranscriptAnalysisService {
  // Analyze a transcript and return the analysis results
  async analyzeTranscript(transcriptId: string): Promise<TranscriptAnalysisResult | null> {
    try {
      // First, get the transcript text
      const { data: transcript, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('id', transcriptId)
        .single();

      if (error || !transcript) {
        console.error('Error fetching transcript:', error);
        return null;
      }

      // Ensure transcript_segments is an array before processing
      const turns: SpeakerTurn[] = Array.isArray(transcript.transcript_segments) 
        ? transcript.transcript_segments 
        : [];
      
      // Analyze sentiment for each turn
      const analyzedTurns = turns.map(turn => ({
        ...turn,
        sentiment: SentimentAnalysisService.analyzeSentiment(turn.text)
      }));

      // Calculate overall sentiment score (simple average)
      const sentiments = analyzedTurns.map(t => 
        t.sentiment === 'positive' ? 1 : 
        t.sentiment === 'negative' ? -1 : 0
      );
      
      const sentimentScore = sentiments.length > 0 
        ? sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length
        : 0;

      // Extract key phrases (simplified implementation)
      const keyPhrases = this.extractKeyPhrases(transcript.text);

      // Calculate keyword frequency
      const keywordFrequency = this.calculateKeywordFrequency(transcript.text);

      // Calculate speaker ratio
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

      // Calculate call duration (if timestamps available)
      let callDuration = 0;
      if (turns.length > 0 && turns[0].timestamp && turns[turns.length - 1].timestamp) {
        const startTime = new Date(turns[0].timestamp).getTime();
        const endTime = new Date(turns[turns.length - 1].timestamp).getTime();
        callDuration = (endTime - startTime) / 1000; // in seconds
      }

      // Identify topics (simplified)
      const topics = this.identifyTopics(keyPhrases, keywordFrequency);

      // Create the analysis result
      const analysisResult: TranscriptAnalysisResult = {
        sentimentScore,
        keyPhrases,
        keywordFrequency,
        callDuration,
        speakerRatio,
        topics
      };

      // Store the analysis in the database
      await this.saveAnalysisResults(transcriptId, analysisResult, analyzedTurns);

      return analysisResult;
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      return null;
    }
  }

  // Save analysis results to the database
  private async saveAnalysisResults(
    transcriptId: string, 
    analysis: TranscriptAnalysisResult,
    analyzedTurns: SpeakerTurn[]
  ): Promise<void> {
    try {
      // Update the transcript with the analysis results
      const { error } = await supabase
        .from('call_transcripts')
        .update({
          sentiment_score: analysis.sentimentScore,
          key_phrases: analysis.keyPhrases,
          keyword_frequency: analysis.keywordFrequency,
          analyzed_turns: analyzedTurns,
          analyzed_at: new Date().toISOString()
        })
        .eq('id', transcriptId);

      if (error) {
        console.error('Error saving analysis results:', error);
      }
    } catch (error) {
      console.error('Error in saveAnalysisResults:', error);
    }
  }

  // Extract key phrases from text (simplified)
  private extractKeyPhrases(text: string): string[] {
    const phrases = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      // Simple heuristic: sentences with 3-10 words that don't start with common words
      const words = sentence.trim().split(/\s+/);
      if (words.length >= 3 && words.length <= 10) {
        const firstWord = words[0].toLowerCase();
        if (!['the', 'a', 'an', 'and', 'but', 'or', 'so', 'because', 'if', 'when'].includes(firstWord)) {
          phrases.push(sentence.trim());
        }
      }
    }
    
    return phrases.slice(0, 5); // Return top 5 phrases
  }

  // Calculate keyword frequency
  private calculateKeywordFrequency(text: string): Record<string, number> {
    const frequency: Record<string, number> = {};
    const stopWords = ['the', 'a', 'an', 'and', 'but', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'is', 'are', 'was', 'were'];
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    for (const word of words) {
      if (word.length > 2 && !stopWords.includes(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    }
    
    // Sort by frequency and take top 20
    const sortedWords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return Object.fromEntries(sortedWords);
  }

  // Identify topics from key phrases and keyword frequency
  private identifyTopics(keyPhrases: string[], keywordFrequency: Record<string, number>): string[] {
    // Simplified implementation: take top keywords as topics
    const topics = Object.keys(keywordFrequency).slice(0, 5);
    
    // Add any key phrases that aren't already included
    for (const phrase of keyPhrases) {
      const simplified = phrase.toLowerCase().replace(/[^a-z0-9 ]/g, '');
      if (!topics.some(topic => simplified.includes(topic))) {
        topics.push(phrase);
      }
      if (topics.length >= 8) break;
    }
    
    return topics.slice(0, 8); // Return max 8 topics
  }

  // Add the missing methods needed by DatabaseService
  
  // Split text by speaker
  splitBySpeaker(text: string, segments: any[], numSpeakers: number): SpeakerTurn[] {
    try {
      // Simple implementation: alternating speakers
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const turns: SpeakerTurn[] = [];
      
      for (let i = 0; i < sentences.length; i++) {
        const speaker = i % 2 === 0 ? 'agent' : 'customer';
        turns.push({
          speaker,
          text: sentences[i].trim(),
          timestamp: new Date(Date.now() + i * 10000).toISOString(), // Fake timestamps 10 seconds apart
          sentiment: SentimentAnalysisService.analyzeSentiment(sentences[i])
        });
      }
      
      return turns;
    } catch (error) {
      console.error('Error splitting text by speaker:', error);
      return [];
    }
  }
  
  // Extract keywords from text
  extractKeywords(text: string): string[] {
    const frequency = this.calculateKeywordFrequency(text);
    return Object.keys(frequency).slice(0, 10); // Return top 10 keywords
  }
  
  // Analyze sentiment of text
  analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    return SentimentAnalysisService.analyzeSentiment(text);
  }
  
  // Generate a call score based on text and sentiment
  generateCallScore(text: string, sentiment: string): number {
    // Simple scoring: 
    // - Positive sentiment: 75-100
    // - Neutral sentiment: 50-75
    // - Negative sentiment: 25-50
    // - Text length also factors in (longer = higher within range)
    
    const baseScore = 
      sentiment === 'positive' ? 75 : 
      sentiment === 'negative' ? 25 : 50;
    
    // Adjust score based on text length (longer text = more detailed = better score)
    const lengthFactor = Math.min(Math.max(text.length / 1000, 0), 1); // 0-1 based on text length
    const lengthBonus = 25 * lengthFactor; // Add up to 25 points based on length
    
    return Math.round(baseScore + lengthBonus);
  }
}

export const transcriptAnalysisService = new TranscriptAnalysisService();
