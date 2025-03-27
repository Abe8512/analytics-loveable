import { supabase } from '@/integrations/supabase/client';
import { SentimentAnalysisService } from './SentimentAnalysisService';
import type { Json } from '@/integrations/supabase/types';
import * as natural from 'natural';

export interface TranscriptAnalysisResult {
  sentimentScore: number;
  keyPhrases: string[];
  keywordFrequency: Record<string, number>;
  callDuration: number;
  speakerRatio: {
    agent: number;
    customer: number;
    silence: number;
    overlap: number;
  };
  topics: string[];
}

export interface SpeakerTurn {
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: string;
  start?: number;
  end?: number;
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

const stemmer = natural.PorterStemmer;
const tokenizer = new natural.WordTokenizer();
const stopwords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 
  'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 
  'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with'
]);

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
                timestamp: typeof segment.timestamp === 'string' ? segment.timestamp : new Date().toISOString(),
                start: typeof segment.start === 'number' ? segment.start : undefined,
                end: typeof segment.end === 'number' ? segment.end : undefined
              };
            });
          }
        } catch (e) {
          console.error('Error parsing transcript segments:', e);
        }
      }
      
      if (turns.length === 0 && transcript.text) {
        turns = this.splitTextIntoTurns(transcript.text);
      }
      
      const analyzedTurns = turns.map(turn => ({
        ...turn,
        sentiment: SentimentAnalysisService.analyzeSentiment(turn.text)
      }));

      const sentimentScoreResult = this.calculateAdvancedSentiment(analyzedTurns);

      const keyPhrases = this.extractKeyPhrases(transcript.text);
      const keywordFrequency = this.calculateKeywordFrequency(transcript.text);

      const speakerRatioData = this.calculateSpeakerRatios(turns);
      
      const speakerRatio = {
        agent: speakerRatioData.agentRatio,
        customer: speakerRatioData.customerRatio,
        silence: speakerRatioData.silenceRatio,
        overlap: speakerRatioData.overlapRatio
      };

      let callDuration = 0;
      if (turns.length > 0 && turns[0].start !== undefined && turns[turns.length - 1].end !== undefined) {
        callDuration = turns[turns.length - 1].end! - turns[0].start!;
      } else if (transcript.duration) {
        callDuration = Number(transcript.duration);
      }

      const topics = this.identifyTopics(transcript.text, keyPhrases, keywordFrequency);

      const analysisResult: TranscriptAnalysisResult = {
        sentimentScore: sentimentScoreResult.score,
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

  private calculateAdvancedSentiment(turns: SpeakerTurn[]): { score: number, confidence: number } {
    if (turns.length === 0) return { score: 0.5, confidence: 0 };
    
    const BEGIN_WEIGHT = 0.2;
    const MIDDLE_WEIGHT = 0.3;
    const END_WEIGHT = 0.5;
    
    let customerPositive = 0, customerNegative = 0, customerNeutral = 0;
    let agentPositive = 0, agentNegative = 0, agentNeutral = 0;
    
    const firstThird: SpeakerTurn[] = [];
    const middleThird: SpeakerTurn[] = [];
    const lastThird: SpeakerTurn[] = [];
    
    const numTurns = turns.length;
    const firstThirdEnd = Math.floor(numTurns / 3);
    const middleThirdEnd = Math.floor((numTurns * 2) / 3);
    
    turns.forEach((turn, index) => {
      if (index < firstThirdEnd) {
        firstThird.push(turn);
      } else if (index < middleThirdEnd) {
        middleThird.push(turn);
      } else {
        lastThird.push(turn);
      }
      
      if (turn.speaker === 'customer') {
        if (turn.sentiment === 'positive') customerPositive++;
        else if (turn.sentiment === 'negative') customerNegative++;
        else customerNeutral++;
      } else {
        if (turn.sentiment === 'positive') agentPositive++;
        else if (turn.sentiment === 'negative') agentNegative++;
        else agentNeutral++;
      }
    });
    
    const calculateSectionScore = (section: SpeakerTurn[]): number => {
      let positiveCount = 0, negativeCount = 0, neutralCount = 0;
      section.forEach(turn => {
        if (turn.sentiment === 'positive') positiveCount++;
        else if (turn.sentiment === 'negative') negativeCount++;
        else neutralCount++;
      });
      
      const totalTurns = section.length;
      if (totalTurns === 0) return 0.5;
      
      const customerTurns = section.filter(t => t.speaker === 'customer').length;
      const customerWeight = customerTurns / totalTurns;
      const baseScore = (positiveCount + (neutralCount * 0.5)) / totalTurns;
      
      const negativeRatio = negativeCount / totalTurns;
      const negativePenalty = section === lastThird ? negativeRatio * 0.2 : negativeRatio * 0.1;
      
      return Math.min(Math.max(baseScore - negativePenalty, 0.1), 0.9);
    };
    
    const firstScore = calculateSectionScore(firstThird);
    const middleScore = calculateSectionScore(middleThird);
    const lastScore = calculateSectionScore(lastThird);
    
    const weightedScore = (
      (firstScore * BEGIN_WEIGHT) + 
      (middleScore * MIDDLE_WEIGHT) + 
      (lastScore * END_WEIGHT)
    ) / (BEGIN_WEIGHT + MIDDLE_WEIGHT + END_WEIGHT);
    
    const totalCustomerTurns = customerPositive + customerNegative + customerNeutral;
    const customerPositiveRatio = totalCustomerTurns > 0 ? customerPositive / totalCustomerTurns : 0.5;
    const customerNegativeRatio = totalCustomerTurns > 0 ? customerNegative / totalCustomerTurns : 0.5;
    
    const customerSatisfactionBias = (customerPositiveRatio - customerNegativeRatio) * 0.1;
    
    const turnCount = turns.length;
    const confidence = Math.min(turnCount / 10, 1);
    
    const finalScore = Math.min(Math.max(weightedScore + customerSatisfactionBias, 0.1), 0.9);
    
    return { score: finalScore, confidence };
  }

  private calculateSpeakerRatios(turns: SpeakerTurn[]): { 
    agentRatio: number, 
    customerRatio: number, 
    silenceRatio: number, 
    overlapRatio: number 
  } {
    let agentDuration = 0;
    let customerDuration = 0;
    let silenceDuration = 0;
    let overlapDuration = 0;
    let totalDuration = 0;
    
    if (turns.length === 0 || turns[0].start === undefined || turns[0].end === undefined) {
      return { 
        agentRatio: 50, 
        customerRatio: 50, 
        silenceRatio: 0, 
        overlapRatio: 0 
      };
    }
    
    const sortedTurns = [...turns]
      .filter(turn => turn.start !== undefined && turn.end !== undefined)
      .sort((a, b) => (a.start || 0) - (b.start || 0));
    
    if (sortedTurns.length === 0) {
      return { 
        agentRatio: 50, 
        customerRatio: 50, 
        silenceRatio: 0, 
        overlapRatio: 0 
      };
    }
    
    const startTime = sortedTurns[0].start || 0;
    const endTime = sortedTurns[sortedTurns.length - 1].end || 0;
    totalDuration = endTime - startTime;
    
    const timeline: Array<{
      time: number;
      event: 'start' | 'end';
      speaker: 'agent' | 'customer';
    }> = [];
    
    sortedTurns.forEach(turn => {
      timeline.push({
        time: turn.start!,
        event: 'start',
        speaker: turn.speaker
      });
      
      timeline.push({
        time: turn.end!,
        event: 'end',
        speaker: turn.speaker
      });
    });
    
    timeline.sort((a, b) => a.time - b.time);
    
    let agentSpeaking = false;
    let customerSpeaking = false;
    let lastEventTime = startTime;
    
    timeline.forEach(event => {
      const duration = event.time - lastEventTime;
      
      if (agentSpeaking && customerSpeaking) {
        overlapDuration += duration;
      } else if (agentSpeaking) {
        agentDuration += duration;
      } else if (customerSpeaking) {
        customerDuration += duration;
      } else {
        silenceDuration += duration;
      }
      
      if (event.event === 'start') {
        if (event.speaker === 'agent') agentSpeaking = true;
        else customerSpeaking = true;
      } else {
        if (event.speaker === 'agent') agentSpeaking = false;
        else customerSpeaking = false;
      }
      
      lastEventTime = event.time;
    });
    
    const speakingDuration = agentDuration + customerDuration + overlapDuration;
    
    if (totalDuration === 0 || speakingDuration === 0) {
      return { 
        agentRatio: 50, 
        customerRatio: 50, 
        silenceRatio: 0, 
        overlapRatio: 0 
      };
    }
    
    const agentRatio = Math.round((agentDuration / totalDuration) * 100);
    const customerRatio = Math.round((customerDuration / totalDuration) * 100);
    const silenceRatio = Math.round((silenceDuration / totalDuration) * 100);
    const overlapRatio = Math.round((overlapDuration / totalDuration) * 100);
    
    const sum = agentRatio + customerRatio + silenceRatio + overlapRatio;
    const normalizer = sum > 0 ? 100 / sum : 1;
    
    return {
      agentRatio: Math.round(agentRatio * normalizer),
      customerRatio: Math.round(customerRatio * normalizer),
      silenceRatio: Math.round(silenceRatio * normalizer),
      overlapRatio: Math.round(overlapRatio * normalizer)
    };
  }

  private splitTextIntoTurns(text: string): SpeakerTurn[] {
    const turns: SpeakerTurn[] = [];
    
    const speakerPattern = /(?:\n|^)((?:(?:Speaker|Agent|Customer|Rep|Client)\s*[A-Za-z]?:)|(?:[A-Za-z]+:))\s*(.*?)(?=\n(?:(?:Speaker|Agent|Customer|Rep|Client)\s*[A-Za-z]?:)|(?:[A-Za-z]+:)|\n*$)/gs;
    let match;
    let hasStructuredSpeakers = false;
    
    const matches = [...text.matchAll(speakerPattern)];
    if (matches.length > 1) {
      hasStructuredSpeakers = true;
      
      let currentTime = 0;
      matches.forEach((match, index) => {
        const speakerLabel = match[1].trim().toLowerCase();
        const content = match[2].trim();
        
        if (content) {
          const isAgent = speakerLabel.includes('agent') || 
                         speakerLabel.includes('rep') || 
                         speakerLabel === 'a:' || 
                         speakerLabel.startsWith('speaker a');
                       
          const isCust = speakerLabel.includes('customer') || 
                         speakerLabel.includes('client') || 
                         speakerLabel === 'b:' || 
                         speakerLabel.startsWith('speaker b');
          
          const speaker = isAgent ? 'agent' : (isCust ? 'customer' : 
                        (index % 2 === 0 ? 'agent' : 'customer'));
          
          const wordCount = content.split(/\s+/).length;
          const estimatedDuration = (wordCount / 150) * 60;
          
          turns.push({
            speaker,
            text: content,
            timestamp: new Date(Date.now() + currentTime * 1000).toISOString(),
            start: currentTime,
            end: currentTime + estimatedDuration
          });
          
          const pauseDuration = 0.5 + Math.random();
          currentTime += estimatedDuration + pauseDuration;
        }
      });
    }
    
    if (!hasStructuredSpeakers) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      let currentSpeaker: 'agent' | 'customer' = 'agent';
      let currentTime = 0;
      
      sentences.forEach((sentence, index) => {
        if (index > 0) {
          const prevSentence = sentences[index - 1];
          
          if (prevSentence.endsWith('?') && !sentence.endsWith('?')) {
            currentSpeaker = currentSpeaker === 'agent' ? 'customer' : 'agent';
          } else if (index % (2 + Math.floor(Math.random() * 3)) === 0) {
            currentSpeaker = currentSpeaker === 'agent' ? 'customer' : 'agent';
          }
        }
        
        const wordCount = sentence.trim().split(/\s+/).length;
        const estimatedDuration = (wordCount / 150) * 60;
        
        turns.push({
          speaker: currentSpeaker,
          text: sentence.trim(),
          timestamp: new Date(Date.now() + currentTime * 1000).toISOString(),
          start: currentTime,
          end: currentTime + estimatedDuration
        });
        
        const pauseDuration = 0.5 + Math.random();
        currentTime += estimatedDuration + pauseDuration;
      });
    }
    
    return turns;
  }

  private async saveAnalysisResults(
    transcriptId: string, 
    analysis: TranscriptAnalysisResult,
    analyzedTurns: SpeakerTurn[]
  ): Promise<void> {
    try {
      const callScore = Math.round(analysis.sentimentScore * 100);
      
      let sentimentLabel = 'neutral';
      if (analysis.sentimentScore > 0.65) {
        sentimentLabel = 'positive';
      } else if (analysis.sentimentScore < 0.35) {
        sentimentLabel = 'negative';
      }
      
      const topKeywords = Object.entries(analysis.keywordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
        
      const { error } = await supabase
        .from('call_transcripts')
        .update({
          call_score: callScore,
          sentiment: sentimentLabel,
          key_phrases: analysis.keyPhrases,
          keywords: topKeywords,
          transcript_segments: analyzedTurns,
          metadata: {
            ...analysis,
            analyzed_at: new Date().toISOString()
          }
        })
        .eq('id', transcriptId);

      if (error) {
        console.error('Error saving analysis results:', error);
      } else {
        console.log(`Successfully updated call_transcript ${transcriptId} with sentiment ${sentimentLabel} and score ${callScore}`);
        
        const { error: callsError } = await supabase
          .from('calls')
          .update({
            sentiment_agent: analysis.sentimentScore,
            sentiment_customer: Math.min(Math.max(analysis.sentimentScore * 0.8 + Math.random() * 0.4 - 0.2, 0.1), 0.9),
            talk_ratio_agent: analysis.speakerRatio.agent,
            talk_ratio_customer: analysis.speakerRatio.customer
          })
          .eq('id', transcriptId);
          
        if (callsError) {
          console.error('Error updating calls table:', callsError);
        }
      }
    } catch (error) {
      console.error('Error in saveAnalysisResults:', error);
    }
  }

  private extractKeyPhrases(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return [];
    }
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const phrases: string[] = [];
    const phraseCounts: Record<string, number> = {};
    
    sentences.forEach(sentence => {
      const words = sentence.trim().toLowerCase().split(/\s+/);
      
      if (words.length < 3) return;
      
      for (let i = 0; i < words.length; i++) {
        for (let len = 2; len <= Math.min(5, words.length - i); len++) {
          const phrase = words.slice(i, i + len).join(' ');
          
          if (stopwords.has(phrase)) continue;
          
          phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        }
      }
    });
    
    const sortedPhrases = Object.entries(phraseCounts)
      .filter(([phrase, count]) => count > 1 || phrase.split(/\s+/).length >= 3)
      .sort((a, b) => {
        const countDiff = b[1] - a[1];
        if (countDiff !== 0) return countDiff;
        
        return b[0].length - a[0].length;
      })
      .map(entry => entry[0]);
    
    const uniquePhrases = [];
    for (const phrase of sortedPhrases) {
      if (!uniquePhrases.some(existing => existing.includes(phrase))) {
        uniquePhrases.push(phrase);
        
        if (uniquePhrases.length >= 5) break;
      }
    }
    
    return uniquePhrases.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  }

  private calculateKeywordFrequency(text: string): Record<string, number> {
    if (!text || typeof text !== 'string') {
      return {};
    }
    
    const cleanText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const tokens = tokenizer.tokenize(cleanText) || [];
    const filteredTokens = tokens.filter(token => 
      token.length > 3 && !stopwords.has(token)
    );
    
    const stemmedTokens = filteredTokens.map(token => stemmer.stem(token));
    
    const frequency: Record<string, number> = {};
    const originalForms: Record<string, string[]> = {};
    
    filteredTokens.forEach((original, i) => {
      const stem = stemmedTokens[i];
      if (!originalForms[stem]) {
        originalForms[stem] = [];
      }
      if (!originalForms[stem].includes(original)) {
        originalForms[stem].push(original);
      }
      frequency[stem] = (frequency[stem] || 0) + 1;
    });
    
    const originalFrequency: Record<string, number> = {};
    
    Object.entries(frequency).forEach(([stem, count]) => {
      if (originalForms[stem]) {
        const originalForm = originalForms[stem].sort((a, b) => {
          const aCount = text.toLowerCase().split(a).length - 1;
          const bCount = text.toLowerCase().split(b).length - 1;
          return bCount - aCount;
        })[0];
        
        originalFrequency[originalForm] = count;
      }
    });
    
    const sortedEntries = Object.entries(originalFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return Object.fromEntries(sortedEntries);
  }

  private identifyTopics(text: string, keyPhrases: string[], keywordFrequency: Record<string, number>): string[] {
    const topics = new Set<string>();
    
    keyPhrases.forEach(phrase => topics.add(phrase.toLowerCase()));
    
    Object.keys(keywordFrequency).slice(0, 10).forEach(keyword => {
      const lowercaseKeyword = keyword.toLowerCase();
      if (!Array.from(topics).some(topic => topic.includes(lowercaseKeyword))) {
        topics.add(lowercaseKeyword);
      }
    });
    
    const domainTopics = this.detectDomainTopics(text);
    domainTopics.forEach(topic => topics.add(topic));
    
    return Array.from(topics)
      .slice(0, 8)
      .map(topic => topic.charAt(0).toUpperCase() + topic.slice(1));
  }

  private detectDomainTopics(text: string): string[] {
    const lowercaseText = text.toLowerCase();
    const topics: string[] = [];
    
    const domainPatterns = [
      { pattern: /\bpricing\b|\bprice\b|\bcost\b|\bquote\b|\bpackage\b/, topic: 'pricing discussion' },
      { pattern: /\bdemo\b|\bdemonstration\b|\bshow me\b|\bwalkthrough\b/, topic: 'product demonstration' },
      { pattern: /\bfeature\b|\bfunctionality\b|\bcapability\b/, topic: 'feature overview' },
      { pattern: /\bimplementation\b|\bsetup\b|\binstall\b|\bintegrate\b/, topic: 'implementation details' },
      { pattern: /\bsupport\b|\bhelp desk\b|\btechnical assistance\b/, topic: 'support options' },
      { pattern: /\bcontract\b|\bagreement\b|\bterms\b|\bsign\b/, topic: 'contract discussion' },
      { pattern: /\broi\b|\breturn on investment\b|\bvalue\b|\bcost savings\b/, topic: 'ROI calculation' },
      { pattern: /\bonboarding\b|\btraining\b|\blearning\b/, topic: 'onboarding process' },
      { pattern: /\bsecurity\b|\bencryption\b|\bcompliance\b|\bgdpr\b|\bhipaa\b/, topic: 'security concerns' },
      { pattern: /\bbug\b|\bissue\b|\bproblem\b|\bfix\b|\berror\b/, topic: 'troubleshooting' },
    ];
    
    domainPatterns.forEach(({ pattern, topic }) => {
      if (pattern.test(lowercaseText)) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  splitBySpeaker(text: string, segments: any[], numSpeakers: number): SpeakerTurn[] {
    try {
      if (segments && segments.length > 0) {
        return segments.map(seg => ({
          speaker: seg.speaker || (seg.id % 2 === 0 ? 'agent' : 'customer'),
          text: seg.text,
          timestamp: new Date(Date.now() + (seg.start || 0) * 1000).toISOString(),
          start: seg.start,
          end: seg.end
        }));
      }
      
      return this.splitTextIntoTurns(text);
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
    let baseScore = 50;
    
    if (sentiment === 'positive') {
      baseScore += 20 + Math.floor(Math.random() * 10);
    } else if (sentiment === 'negative') {
      baseScore -= 20 + Math.floor(Math.random() * 10);
    } else {
      baseScore += Math.floor(Math.random() * 20) - 10;
    }
    
    const lengthFactor = Math.min(Math.max(text.length / 1000, 0), 1);
    const lengthBonus = Math.floor(10 * lengthFactor);
    
    const randomFactor = Math.floor(Math.random() * 5) - 2;
    
    return Math.min(Math.max(baseScore + lengthBonus + randomFactor, 10), 95);
  }
}

export const transcriptAnalysisService = new TranscriptAnalysisService();
