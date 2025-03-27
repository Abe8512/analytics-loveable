
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
        .select('id, sentiment, created_at, user_id')
        .order('created_at', { ascending: false });

      if (transcriptError) {
        console.error('Error fetching transcripts for sentiment:', transcriptError);
        throw transcriptError;
      }

      if (transcriptData && transcriptData.length > 0) {
        // Map transcript data to sentiment records with proper type casting
        const mappedData: SentimentRecord[] = transcriptData.map(t => ({
          id: t.id,
          user_id: t.user_id,
          // Ensure the sentiment_label is one of the allowed values
          sentiment_label: (t.sentiment === 'positive' ? 'positive' : 
                           t.sentiment === 'negative' ? 'negative' : 'neutral') as 'positive' | 'neutral' | 'negative',
          confidence: t.sentiment === 'positive' ? 0.8 : 
                     t.sentiment === 'negative' ? 0.3 : 0.6,
          recorded_at: t.created_at
        }));
        
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

// Mock sentiment trends for development
const getMockSentimentTrends = (): SentimentRecord[] => {
  const now = new Date();
  return Array.from({ length: 5 }).map((_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    
    // Determine sentiment based on index
    let sentiment: 'positive' | 'neutral' | 'negative';
    if (index % 3 === 0) sentiment = 'positive';
    else if (index % 3 === 1) sentiment = 'negative';
    else sentiment = 'neutral';
    
    return {
      id: `mock-${index}`,
      sentiment_label: sentiment,
      confidence: Math.random() * 0.5 + 0.5,
      recorded_at: date.toISOString()
    };
  });
};

export class SentimentAnalysisService {
  // This could be expanded with more methods as needed
  static analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    // Simple sentiment analysis logic
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'pleased'];
    const negativeWords = ['bad', 'poor', 'terrible', 'unhappy', 'disappointed'];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
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
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService();
