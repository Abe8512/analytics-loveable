
// Sentiment analysis interfaces and services
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const fetchSentimentTrends = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sentiment_trends')
          .select('*')
          .order('recorded_at', { ascending: false });

        if (error) {
          console.error('Error fetching sentiment trends:', error);
          throw error;
        }

        setSentimentTrends(data || []);
      } catch (error) {
        console.error('Failed to fetch sentiment trends:', error);
        // Generate mock data if no trends are available
        setSentimentTrends(getMockSentimentTrends());
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentTrends();
  }, []);

  return { sentimentTrends, loading };
};

// Mock sentiment trends for development
const getMockSentimentTrends = (): SentimentRecord[] => {
  const now = new Date();
  return Array.from({ length: 5 }).map((_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    
    return {
      id: `mock-${index}`,
      sentiment_label: index % 3 === 0 ? 'positive' : index % 3 === 1 ? 'negative' : 'neutral',
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
