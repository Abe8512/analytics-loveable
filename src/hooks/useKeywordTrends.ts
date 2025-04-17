
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type KeywordCategory = 'all' | 'positive' | 'negative' | 'objection' | 'product';

interface KeywordTrend {
  keyword: string;
  occurrences: number;
  change: number;
  category: KeywordCategory;
}

interface KeywordTrendsData {
  all: KeywordTrend[];
  positive: KeywordTrend[];
  negative: KeywordTrend[];
  objection: KeywordTrend[];
  product: KeywordTrend[];
}

export const useKeywordTrends = () => {
  const [keywordTrends, setKeywordTrends] = useState<KeywordTrendsData>({
    all: [],
    positive: [],
    negative: [],
    objection: [],
    product: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchKeywordTrends = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to fetch from keyword_trends table in Supabase
      const { data, error } = await supabase
        .from('keyword_trends')
        .select('*')
        .order('occurrences', { ascending: false });
        
      if (error) {
        console.error('Error fetching keyword trends:', error);
        // Fall back to mock data if there's an error
        setKeywordTrends(getMockKeywordTrends());
      } else if (data && data.length > 0) {
        // Process real data from Supabase
        const processed = processKeywordData(data);
        setKeywordTrends(processed);
      } else {
        // No data found, use mock data
        setKeywordTrends(getMockKeywordTrends());
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error in fetchKeywordTrends:', err);
      setError('Failed to load keyword trends');
      setKeywordTrends(getMockKeywordTrends());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeywordTrends();
  }, [fetchKeywordTrends]);

  // Process keyword data from database
  const processKeywordData = (data: any[]): KeywordTrendsData => {
    const result: KeywordTrendsData = {
      all: [],
      positive: [],
      negative: [],
      objection: [],
      product: []
    };
    
    // Add all keywords to the "all" category
    result.all = data.map(item => ({
      keyword: item.keyword,
      occurrences: item.occurrences || 0,
      change: item.change || 0,
      category: item.category || 'all'
    }));
    
    // Filter keywords into their respective categories
    data.forEach(item => {
      const trend: KeywordTrend = {
        keyword: item.keyword,
        occurrences: item.occurrences || 0,
        change: item.change || 0,
        category: item.category as KeywordCategory || 'all'
      };
      
      if (item.category === 'positive') {
        result.positive.push(trend);
      } else if (item.category === 'negative') {
        result.negative.push(trend);
      } else if (item.category === 'objection') {
        result.objection.push(trend);
      } else if (item.category === 'product') {
        result.product.push(trend);
      }
    });
    
    return result;
  };

  // Generate mock keyword trends data
  const getMockKeywordTrends = (): KeywordTrendsData => {
    const positiveKeywords = [
      { keyword: 'interested', occurrences: 42, change: 8, category: 'positive' as KeywordCategory },
      { keyword: 'excellent', occurrences: 36, change: 4, category: 'positive' as KeywordCategory },
      { keyword: 'excited', occurrences: 29, change: -2, category: 'positive' as KeywordCategory },
      { keyword: 'helpful', occurrences: 28, change: 6, category: 'positive' as KeywordCategory },
      { keyword: 'love it', occurrences: 23, change: 3, category: 'positive' as KeywordCategory }
    ];
    
    const negativeKeywords = [
      { keyword: 'expensive', occurrences: 31, change: -5, category: 'negative' as KeywordCategory },
      { keyword: 'complicated', occurrences: 24, change: -3, category: 'negative' as KeywordCategory },
      { keyword: 'difficult', occurrences: 21, change: 2, category: 'negative' as KeywordCategory },
      { keyword: 'confusing', occurrences: 18, change: -1, category: 'negative' as KeywordCategory },
      { keyword: 'not working', occurrences: 14, change: -6, category: 'negative' as KeywordCategory }
    ];
    
    const objectionKeywords = [
      { keyword: 'need time', occurrences: 38, change: 5, category: 'objection' as KeywordCategory },
      { keyword: 'too costly', occurrences: 32, change: -3, category: 'objection' as KeywordCategory },
      { keyword: 'other options', occurrences: 27, change: 2, category: 'objection' as KeywordCategory },
      { keyword: 'not now', occurrences: 23, change: -1, category: 'objection' as KeywordCategory },
      { keyword: 'competitor', occurrences: 19, change: 4, category: 'objection' as KeywordCategory }
    ];
    
    const productKeywords = [
      { keyword: 'analytics', occurrences: 45, change: 7, category: 'product' as KeywordCategory },
      { keyword: 'dashboard', occurrences: 39, change: 5, category: 'product' as KeywordCategory },
      { keyword: 'integration', occurrences: 34, change: 2, category: 'product' as KeywordCategory },
      { keyword: 'reporting', occurrences: 30, change: 6, category: 'product' as KeywordCategory },
      { keyword: 'API', occurrences: 22, change: -1, category: 'product' as KeywordCategory }
    ];
    
    const allKeywords = [
      ...positiveKeywords,
      ...negativeKeywords,
      ...objectionKeywords,
      ...productKeywords
    ].sort((a, b) => b.occurrences - a.occurrences);
    
    return {
      all: allKeywords,
      positive: positiveKeywords,
      negative: negativeKeywords,
      objection: objectionKeywords,
      product: productKeywords
    };
  };

  return {
    keywordTrends,
    isLoading,
    error,
    lastUpdated,
    fetchKeywordTrends
  };
};
