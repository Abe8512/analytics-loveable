
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useSharedFilters } from "@/contexts/SharedFilterContext";

export interface KeywordAnalysis {
  keyword: string;
  occurrence_count: number;
  avg_sentiment: number;
  first_occurrence?: string;
  last_occurrence?: string;
}

export interface KeywordTrend {
  id: string;
  keyword: string;
  count: number;
  category: "positive" | "neutral" | "negative";
  last_used: string;
  created_at: string;
  updated_at: string;
  report_date: string;
  time_period: string;
}

export class KeywordAnalysisService {
  public async getKeywordAnalysis(): Promise<KeywordAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('keyword_analysis_view')
        .select('*')
        .order('occurrence_count', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching keyword analysis:', error);
        return [];
      }
      
      return data as KeywordAnalysis[];
    } catch (error) {
      console.error('Exception in getKeywordAnalysis:', error);
      return [];
    }
  }
  
  public async getKeywordTrends(): Promise<KeywordTrend[]> {
    try {
      const { data, error } = await supabase
        .from('keyword_trends')
        .select('*')
        .order('count', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching keyword trends:', error);
        return [];
      }
      
      // Convert the category string to the expected enum type
      const typedData = data.map(item => ({
        ...item,
        category: (item.category as "positive" | "neutral" | "negative") || "neutral"
      }));
      
      return typedData;
    } catch (error) {
      console.error('Exception in getKeywordTrends:', error);
      return [];
    }
  }
  
  public extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Remove common stopwords and punctuation
    const stopwords = new Set([
      'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 
      'in', 'out', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'of', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);
    
    // Split by spaces, remove stopwords and very short words
    const words = text.toLowerCase()
      .replace(/[.,\/#!?$%\^&\*;:{}=\_`~()]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopwords.has(word));
    
    // Count frequency
    const frequency: {[key: string]: number} = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWords = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]);
    
    // Return top keywords
    return sortedWords.slice(0, 20);
  }
}

export const keywordAnalysisService = new KeywordAnalysisService();

export const useKeywordAnalysis = () => {
  const [keywords, setKeywords] = useState<KeywordAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchKeywords = async () => {
      setLoading(true);
      try {
        const data = await keywordAnalysisService.getKeywordAnalysis();
        setKeywords(data);
      } catch (error) {
        console.error('Error in useKeywordAnalysis:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeywords();
  }, []);
  
  return { keywords, loading };
};

export const useKeywordTrends = () => {
  const [keywordTrends, setKeywordTrends] = useState<KeywordTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const { filters } = useSharedFilters();
  
  useEffect(() => {
    const fetchKeywordTrends = async () => {
      setLoading(true);
      try {
        const data = await keywordAnalysisService.getKeywordTrends();
        setKeywordTrends(data as KeywordTrend[]);
      } catch (error) {
        console.error('Error in useKeywordTrends:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeywordTrends();
  }, [filters.dateRange]);
  
  return { keywordTrends, loading };
};
