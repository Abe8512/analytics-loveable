
// Sentiment analysis interfaces and services
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEventListener } from '@/services/events/hooks';
import { EventType } from '@/services/events/types';

export interface SentimentTrend {
  date: string;
  avg_agent_sentiment: number;
  avg_customer_sentiment: number;
  total_calls: number;
  positive_agent_calls: number;
  negative_agent_calls: number;
}

export interface SentimentRecord {
  id: string;
  user_id?: string;
  sentiment_label: 'positive' | 'neutral' | 'negative';
  confidence: number;
  recorded_at: string;
}

export const useSentimentTrends = () => {
  const [sentimentTrends, setSentimentTrends] = useState<SentimentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSentimentTrends = useCallback(async () => {
    setLoading(true);
    try {
      // Try to fetch sentiment trends from the dedicated table first
      const { data, error } = await supabase
        .from('sentiment_trends')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching sentiment trends:', error);
        throw error;
      }

      if (data && data.length > 0) {
        // Ensure the data conforms to the SentimentRecord type
        const typedData: SentimentRecord[] = data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          sentiment_label: (item.sentiment_label || 'neutral') as 'positive' | 'neutral' | 'negative',
          confidence: item.confidence || 0.5,
          recorded_at: item.recorded_at
        }));
        
        setSentimentTrends(typedData);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      // If no dedicated sentiment trends, try to get data from call_transcripts
      const { data: transcriptData, error: transcriptError } = await supabase
        .from('call_transcripts')
        .select('id, sentiment, created_at, user_id, call_score')
        .order('created_at', { ascending: false });

      if (transcriptError) {
        console.error('Error fetching transcripts for sentiment:', transcriptError);
        throw transcriptError;
      }

      if (transcriptData && transcriptData.length > 0) {
        // Map transcript data to sentiment records with proper type casting
        const mappedData: SentimentRecord[] = transcriptData.map(t => {
          // Determine sentiment label based on call_score or sentiment field
          let sentimentLabel: 'positive' | 'neutral' | 'negative';
          let confidence = 0.5;
          
          if (t.sentiment === 'positive' || t.call_score >= 70) {
            sentimentLabel = 'positive';
            confidence = t.call_score ? t.call_score / 100 : 0.8;
          } else if (t.sentiment === 'negative' || (t.call_score !== null && t.call_score < 40)) {
            sentimentLabel = 'negative';
            confidence = t.call_score ? (100 - t.call_score) / 100 : 0.8;
          } else {
            sentimentLabel = 'neutral';
            confidence = 0.6;
          }
          
          return {
            id: t.id,
            user_id: t.user_id,
            sentiment_label: sentimentLabel,
            confidence,
            recorded_at: t.created_at
          };
        });
        
        setSentimentTrends(mappedData);
        setLastUpdated(new Date());
      } else {
        // Generate mock data if no trends are available
        setSentimentTrends(getMockSentimentTrends());
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch sentiment trends:', error);
      // Generate mock data if no trends are available
      setSentimentTrends(getMockSentimentTrends());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSentimentTrends();
  }, [fetchSentimentTrends]);

  // Listen for events that should trigger a refresh
  useEventListener('sentiment-updated', () => {
    console.log('Sentiment updated, refreshing trends...');
    fetchSentimentTrends();
  });

  useEventListener('transcript-created', () => {
    console.log('New transcript created, refreshing sentiment trends...');
    fetchSentimentTrends();
  });

  useEventListener('bulk-upload-completed', () => {
    console.log('Bulk upload completed, refreshing sentiment trends...');
    fetchSentimentTrends();
  });

  return { sentimentTrends, loading, lastUpdated, fetchSentimentTrends };
};

// Mock sentiment trends with more variance for development
const getMockSentimentTrends = (): SentimentRecord[] => {
  const now = new Date();
  return Array.from({ length: 10 }).map((_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    
    // Create more realistic sentiment distribution
    const random = Math.random();
    let sentiment: 'positive' | 'neutral' | 'negative';
    let confidence: number;
    
    if (random > 0.65) {
      sentiment = 'positive';
      confidence = 0.7 + (Math.random() * 0.3); // 0.7-1.0
    } else if (random < 0.3) {
      sentiment = 'negative';
      confidence = 0.6 + (Math.random() * 0.3); // 0.6-0.9
    } else {
      sentiment = 'neutral';
      confidence = 0.5 + (Math.random() * 0.3); // 0.5-0.8
    }
    
    return {
      id: `mock-${index}`,
      sentiment_label: sentiment,
      confidence,
      recorded_at: date.toISOString()
    };
  });
};

export class SentimentAnalysisService {
  // Improved sentiment analysis with better word lists and scoring
  static analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return 'neutral';
    }
    
    const lowerText = text.toLowerCase();
    
    // Expanded word lists
    const positiveWords = [
      'good', 'great', 'excellent', 'happy', 'pleased', 'wonderful', 'fantastic',
      'awesome', 'amazing', 'love', 'best', 'perfect', 'excited', 'thank', 'appreciate',
      'impressive', 'outstanding', 'brilliant', 'exceptional', 'delighted', 'satisfied',
      'enjoy', 'success', 'positive', 'helpful', 'beneficial', 'agree', 'interested',
      'confident', 'magnificent', 'delightful', 'pleasure', 'incredible'
    ];
    
    const negativeWords = [
      'bad', 'poor', 'terrible', 'unhappy', 'disappointed', 'awful', 'horrible',
      'hate', 'worst', 'problem', 'issue', 'concern', 'difficult', 'dislike',
      'fail', 'failure', 'mistake', 'error', 'wrong', 'trouble', 'unfortunately',
      'negative', 'dissatisfied', 'frustrating', 'annoying', 'angry', 'upset',
      'sad', 'sorry', 'regret', 'disappoint', 'inadequate', 'unsatisfactory'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Count occurrences of positive and negative words
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeCount += matches.length;
    });
    
    // Add phrases that indicate sentiment
    if (lowerText.includes('thank you') || lowerText.includes('thanks for')) {
      positiveCount += 2;
    }
    
    if (lowerText.includes('not working') || lowerText.includes('doesn\'t work')) {
      negativeCount += 2;
    }
    
    // Check for negations that flip sentiment
    const negations = ['not', 'no', 'never', 'don\'t', 'doesn\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'couldn\'t', 'shouldn\'t'];
    negations.forEach(negation => {
      const regex = new RegExp(`${negation} .{0,20}\\b(${positiveWords.join('|')})\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        positiveCount -= matches.length;
        negativeCount += matches.length;
      }
    });
    
    // Compare counts to determine overall sentiment
    if (positiveCount > negativeCount + 1) {
      return 'positive';
    } else if (negativeCount > positiveCount + 1) {
      return 'negative';
    }
    
    // If sentiment is close, check for key indicators
    if (lowerText.includes('thank you') || lowerText.includes('great job')) {
      return 'positive';
    } else if (lowerText.includes('not happy') || lowerText.includes('very disappointed')) {
      return 'negative';
    }
    
    return 'neutral';
  }
  
  // Generate a numeric sentiment score from text
  static calculateSentimentScore(text: string): number {
    const sentiment = this.analyzeSentiment(text);
    
    // Base score by sentiment
    let score;
    switch (sentiment) {
      case 'positive':
        score = 0.7 + (Math.random() * 0.3); // 0.7-1.0
        break;
      case 'negative':
        score = Math.random() * 0.3; // 0.0-0.3
        break;
      default:
        score = 0.35 + (Math.random() * 0.3); // 0.35-0.65
    }
    
    // Add some randomness for more natural distribution
    const variance = Math.random() * 0.1 - 0.05; // -0.05 to 0.05
    score = Math.max(0, Math.min(1, score + variance));
    
    return score;
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService();
