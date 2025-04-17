
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type KeywordCategory = 'all' | 'positive' | 'neutral' | 'negative' | 'general';

interface KeywordTrend {
  keyword: string;
  count: number;
  trend: number;
  category: KeywordCategory;
}

interface KeywordTrendResponse {
  [key: string]: KeywordTrend[];
}

// Cache for keyword trend data
let keywordCache: KeywordTrendResponse | null = null;
let lastKeywordCacheTime = 0;
const KEYWORD_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useKeywordTrends = () => {
  const [keywordTrends, setKeywordTrends] = useState<KeywordTrendResponse>({
    all: [],
    positive: [],
    neutral: [],
    negative: [],
    general: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchKeywordTrends = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      // Check cache first unless force refresh
      const now = Date.now();
      if (!forceRefresh && keywordCache && (now - lastKeywordCacheTime < KEYWORD_CACHE_TTL)) {
        setKeywordTrends(keywordCache);
        setLastUpdated(new Date(lastKeywordCacheTime));
        setIsLoading(false);
        return;
      }
      
      // Get keyword data from Supabase keyword_trends table
      const { data: keywordData, error: keywordError } = await supabase
        .from('keyword_trends')
        .select('*')
        .order('occurrence_count', { ascending: false });
        
      if (keywordError) {
        throw keywordError;
      }
      
      if (keywordData && keywordData.length > 0) {
        // Process and categorize keywords
        const trendsByCategory: KeywordTrendResponse = {
          all: [],
          positive: [],
          neutral: [],
          negative: [],
          general: []
        };
        
        keywordData.forEach(trend => {
          const keywordTrend: KeywordTrend = {
            keyword: trend.keyword,
            count: trend.occurrence_count,
            trend: trend.trend_direction || 0,
            category: trend.sentiment_category || 'general'
          };
          
          // Add to 'all' category
          trendsByCategory.all.push(keywordTrend);
          
          // Add to specific category
          if (trend.sentiment_category && 
              ['positive', 'neutral', 'negative', 'general'].includes(trend.sentiment_category)) {
            trendsByCategory[trend.sentiment_category as KeywordCategory].push(keywordTrend);
          } else {
            trendsByCategory.general.push(keywordTrend);
          }
        });
        
        // Update cache
        keywordCache = trendsByCategory;
        lastKeywordCacheTime = now;
        
        setKeywordTrends(trendsByCategory);
        setLastUpdated(new Date());
        setError(null);
      } else {
        // If no data, generate mock data
        const mockData = generateMockKeywordTrends();
        keywordCache = mockData;
        lastKeywordCacheTime = now;
        
        setKeywordTrends(mockData);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching keyword trends:', err);
      setError('Failed to load keyword trends');
      
      // Generate mock data on error
      const mockData = generateMockKeywordTrends();
      setKeywordTrends(mockData);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Generate mock keyword trends data
  const generateMockKeywordTrends = (): KeywordTrendResponse => {
    const categories: KeywordCategory[] = ['positive', 'neutral', 'negative', 'general'];
    
    const positiveKeywords = ['solution', 'value', 'benefit', 'advantage', 'savings', 'excellent', 'perfect', 'great', 'interested', 'excited'];
    const neutralKeywords = ['features', 'information', 'details', 'price', 'timeline', 'specifications', 'process', 'options', 'alternatives', 'comparison'];
    const negativeKeywords = ['problem', 'expensive', 'complicated', 'difficult', 'concern', 'issue', 'frustrating', 'complex', 'unclear', 'unsure'];
    const generalKeywords = ['product', 'service', 'company', 'team', 'market', 'industry', 'customer', 'client', 'project', 'business'];
    
    const mockData: KeywordTrendResponse = {
      all: [],
      positive: [],
      neutral: [],
      negative: [],
      general: []
    };
    
    // Generate positive keywords
    positiveKeywords.forEach((keyword, index) => {
      const trend: KeywordTrend = {
        keyword,
        count: Math.floor(50 - index * 3 + Math.random() * 10),
        trend: Math.floor(Math.random() * 3) - 1,
        category: 'positive'
      };
      mockData.positive.push(trend);
      mockData.all.push(trend);
    });
    
    // Generate neutral keywords
    neutralKeywords.forEach((keyword, index) => {
      const trend: KeywordTrend = {
        keyword,
        count: Math.floor(45 - index * 3 + Math.random() * 10),
        trend: Math.floor(Math.random() * 3) - 1,
        category: 'neutral'
      };
      mockData.neutral.push(trend);
      mockData.all.push(trend);
    });
    
    // Generate negative keywords
    negativeKeywords.forEach((keyword, index) => {
      const trend: KeywordTrend = {
        keyword,
        count: Math.floor(30 - index * 2 + Math.random() * 10),
        trend: Math.floor(Math.random() * 3) - 1,
        category: 'negative'
      };
      mockData.negative.push(trend);
      mockData.all.push(trend);
    });
    
    // Generate general keywords
    generalKeywords.forEach((keyword, index) => {
      const trend: KeywordTrend = {
        keyword,
        count: Math.floor(60 - index * 4 + Math.random() * 15),
        trend: Math.floor(Math.random() * 3) - 1,
        category: 'general'
      };
      mockData.general.push(trend);
      mockData.all.push(trend);
    });
    
    // Sort all categories by count
    Object.keys(mockData).forEach(key => {
      mockData[key as KeywordCategory].sort((a, b) => b.count - a.count);
    });
    
    return mockData;
  };
  
  // Fetch data on mount
  useEffect(() => {
    fetchKeywordTrends();
  }, [fetchKeywordTrends]);
  
  return {
    keywordTrends,
    isLoading,
    error,
    lastUpdated,
    fetchKeywordTrends
  };
};
