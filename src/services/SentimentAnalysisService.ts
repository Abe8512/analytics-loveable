
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from './ErrorHandlingService';
import { useDebounce } from '@/hooks/useDebounce';

export interface SentimentTrend {
  id: string;
  sentiment_label: 'positive' | 'neutral' | 'negative';
  confidence: number;
  user_id?: string;
  recorded_at: string;
}

export interface SentimentTrendsData {
  date: string;
  positive_agent_calls: number;
  negative_agent_calls: number;
  positive_customer_calls: number;
  negative_customer_calls: number;
  total_calls: number;
  avg_agent_sentiment: number;
  avg_customer_sentiment: number;
}

export interface SentimentFilter {
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export const useSentimentAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [sentimentTrends, setSentimentTrends] = useState<SentimentTrend[]>([]);
  const [trendsByDay, setTrendsByDay] = useState<SentimentTrendsData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<SentimentFilter>({
    timeRange: 'month',
    limit: 30
  });
  
  const debouncedFilter = useDebounce(filter, 500);
  
  const fetchSentimentTrends = useCallback(async (options?: SentimentFilter) => {
    try {
      setLoading(true);
      const finalOptions = options || debouncedFilter;
      
      let query = supabase
        .from('sentiment_trends')
        .select('*')
        .order('recorded_at', { ascending: false });
      
      if (finalOptions.userId) {
        query = query.eq('user_id', finalOptions.userId);
      }
      
      if (finalOptions.startDate) {
        query = query.gte('recorded_at', finalOptions.startDate.toISOString());
      }
      
      if (finalOptions.endDate) {
        query = query.lte('recorded_at', finalOptions.endDate.toISOString());
      }
      
      if (finalOptions.limit && finalOptions.limit > 0) {
        query = query.limit(finalOptions.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching sentiment trends: ${error.message}`);
      }
      
      setSentimentTrends(data || []);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error in fetchSentimentTrends'));
      errorHandler.handleError(error, 'SentimentAnalysisService.fetchSentimentTrends');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [debouncedFilter]);
  
  const fetchTrendsByDay = useCallback(async (options?: SentimentFilter) => {
    try {
      setLoading(true);
      const finalOptions = options || debouncedFilter;
      
      // Use the sentiment_trends_view to get trends by day
      let query = supabase
        .from('sentiment_trends_view')
        .select('*')
        .order('date', { ascending: false });
      
      if (finalOptions.limit && finalOptions.limit > 0) {
        query = query.limit(finalOptions.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching trends by day: ${error.message}`);
      }
      
      setTrendsByDay(data || []);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error in fetchTrendsByDay'));
      errorHandler.handleError(error, 'SentimentAnalysisService.fetchTrendsByDay');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [debouncedFilter]);
  
  // Fetch data when filter changes
  useEffect(() => {
    fetchSentimentTrends();
    fetchTrendsByDay();
  }, [debouncedFilter, fetchSentimentTrends, fetchTrendsByDay]);
  
  return {
    loading,
    sentimentTrends,
    trendsByDay,
    error,
    setFilter,
    filter,
    fetchSentimentTrends,
    fetchTrendsByDay
  };
};

export const getSentimentColor = (
  sentiment: 'positive' | 'neutral' | 'negative' | number
): string => {
  if (typeof sentiment === 'number') {
    if (sentiment >= 0.6) return 'text-green-500';
    if (sentiment <= 0.4) return 'text-red-500';
    return 'text-blue-500';
  }
  
  switch (sentiment) {
    case 'positive': return 'text-green-500';
    case 'negative': return 'text-red-500';
    default: return 'text-blue-500';
  }
};

export const calculateSentimentRatio = (
  trends: SentimentTrend[]
): { positive: number; neutral: number; negative: number; total: number } => {
  if (!trends || trends.length === 0) {
    return { positive: 0, neutral: 0, negative: 0, total: 0 };
  }
  
  const counts = trends.reduce(
    (acc, trend) => {
      acc[trend.sentiment_label] += 1;
      acc.total += 1;
      return acc;
    }, 
    { positive: 0, neutral: 0, negative: 0, total: 0 }
  );
  
  return counts;
};
