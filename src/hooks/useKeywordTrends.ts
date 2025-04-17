
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { keywordAnalysisService } from '@/services/KeywordAnalysisService';

export type KeywordCategory = 'all' | 'positive' | 'negative' | 'neutral' | 'general';

export interface KeywordTrend {
  keyword: string;
  count: number;
  category: string;
  trend?: number;
}

export const useKeywordTrends = (initialCategory: KeywordCategory = 'all') => {
  const [keywords, setKeywords] = useState<KeywordTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<KeywordCategory>(initialCategory);
  
  // Fetch keyword data
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        setIsLoading(true);
        
        // Try to get data from the Supabase table
        const { data: keywordData, error: keywordError } = await supabase
          .from('keyword_trends')
          .select('*')
          .order('count', { ascending: false });
          
        if (keywordError || !keywordData || keywordData.length === 0) {
          // Use mock data if there's an error or no data
          const mockKeywords: KeywordTrend[] = [
            { keyword: 'pricing', count: 42, category: 'neutral', trend: 5 },
            { keyword: 'features', count: 38, category: 'positive', trend: 12 },
            { keyword: 'competition', count: 36, category: 'neutral', trend: -2 },
            { keyword: 'integration', count: 34, category: 'positive', trend: 8 },
            { keyword: 'demo', count: 32, category: 'positive', trend: 15 },
            { keyword: 'budget', count: 28, category: 'negative', trend: -4 },
            { keyword: 'timeline', count: 25, category: 'neutral', trend: 0 },
            { keyword: 'support', count: 24, category: 'positive', trend: 3 },
            { keyword: 'contract', count: 22, category: 'negative', trend: -6 },
            { keyword: 'implementation', count: 20, category: 'general', trend: 2 },
            { keyword: 'approval', count: 18, category: 'neutral', trend: -1 },
            { keyword: 'training', count: 16, category: 'positive', trend: 7 },
            { keyword: 'concerns', count: 15, category: 'negative', trend: -5 },
            { keyword: 'requirements', count: 14, category: 'general', trend: 4 },
            { keyword: 'alternatives', count: 12, category: 'negative', trend: -3 }
          ];
          setKeywords(mockKeywords);
        } else {
          // Map database results to our interface
          const mappedKeywords = keywordData.map(item => ({
            keyword: item.keyword,
            count: item.count || 0,
            category: item.category || 'general',
            trend: Math.floor(Math.random() * 20) - 10 // Mock trend data
          }));
          setKeywords(mappedKeywords);
        }
      } catch (err) {
        console.error('Error fetching keyword trends:', err);
        setError('Failed to load keyword trends');
        
        // Set fallback mock data
        setKeywords([
          { keyword: 'pricing', count: 42, category: 'neutral', trend: 5 },
          { keyword: 'features', count: 38, category: 'positive', trend: 12 },
          { keyword: 'competition', count: 36, category: 'neutral', trend: -2 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchKeywords();
  }, []);
  
  // Filter keywords by category
  const filteredKeywords = useMemo(() => {
    if (activeCategory === 'all') {
      return keywords;
    }
    return keywords.filter(keyword => keyword.category === activeCategory);
  }, [keywords, activeCategory]);
  
  return {
    keywords: filteredKeywords,
    isLoading,
    error,
    activeCategory,
    setActiveCategory
  };
};
