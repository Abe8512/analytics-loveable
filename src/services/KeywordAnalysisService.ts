
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from './ErrorHandlingService';
import { useDebounce } from '@/hooks/useDebounce';

export interface KeywordAnalysis {
  keyword: string;
  occurrence_count: number;
  avg_sentiment: number;
  first_occurrence: string;
  last_occurrence: string;
}

export interface KeywordTrend {
  id: string;
  keyword: string;
  category: 'positive' | 'neutral' | 'negative';
  count: number;
  last_used: string;
  time_period?: string;
  created_at?: string;
  updated_at?: string;
}

export interface KeywordFilter {
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  category?: 'positive' | 'neutral' | 'negative' | 'all';
  minCount?: number;
  limit?: number;
}

export const useKeywordAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [topKeywords, setTopKeywords] = useState<KeywordAnalysis[]>([]);
  const [keywordTrends, setKeywordTrends] = useState<KeywordTrend[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<KeywordFilter>({
    timeRange: 'all',
    category: 'all',
    minCount: 2,
    limit: 10
  });
  
  const debouncedFilter = useDebounce(filter, 500);
  
  const fetchTopKeywords = useCallback(async (options?: KeywordFilter) => {
    try {
      setLoading(true);
      const finalOptions = options || debouncedFilter;
      
      let query = supabase
        .from('keyword_analysis_view')
        .select('*')
        .order('occurrence_count', { ascending: false });
      
      if (finalOptions.minCount && finalOptions.minCount > 1) {
        query = query.gte('occurrence_count', finalOptions.minCount);
      }
      
      if (finalOptions.limit && finalOptions.limit > 0) {
        query = query.limit(finalOptions.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching top keywords: ${error.message}`);
      }
      
      setTopKeywords(data || []);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error in fetchTopKeywords'));
      errorHandler.handleError(error, 'KeywordAnalysisService.fetchTopKeywords');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [debouncedFilter]);
  
  const fetchKeywordTrends = useCallback(async (options?: KeywordFilter) => {
    try {
      setLoading(true);
      const finalOptions = options || debouncedFilter;
      
      let query = supabase
        .from('keyword_trends')
        .select('*')
        .order('count', { ascending: false });
      
      if (finalOptions.category && finalOptions.category !== 'all') {
        query = query.eq('category', finalOptions.category);
      }
      
      if (finalOptions.timeRange && finalOptions.timeRange !== 'all') {
        query = query.eq('time_period', finalOptions.timeRange);
      }
      
      if (finalOptions.limit && finalOptions.limit > 0) {
        query = query.limit(finalOptions.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching keyword trends: ${error.message}`);
      }
      
      setKeywordTrends(data || []);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error in fetchKeywordTrends'));
      errorHandler.handleError(error, 'KeywordAnalysisService.fetchKeywordTrends');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [debouncedFilter]);
  
  // Fetch data when filter changes
  useEffect(() => {
    fetchTopKeywords();
    fetchKeywordTrends();
  }, [debouncedFilter, fetchTopKeywords, fetchKeywordTrends]);
  
  return {
    loading,
    topKeywords,
    keywordTrends,
    error,
    setFilter,
    filter,
    fetchTopKeywords,
    fetchKeywordTrends
  };
};

export const getKeywordSentiment = (avgSentiment: number): 'positive' | 'neutral' | 'negative' => {
  if (avgSentiment >= 0.6) return 'positive';
  if (avgSentiment <= 0.4) return 'negative';
  return 'neutral';
};

export const getKeywordSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative' | number): string => {
  if (typeof sentiment === 'number') {
    sentiment = getKeywordSentiment(sentiment);
  }
  
  switch (sentiment) {
    case 'positive': return 'text-green-500';
    case 'negative': return 'text-red-500';
    default: return 'text-blue-500';
  }
};
