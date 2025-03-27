
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
  category: "positive" | "neutral" | "negative" | "general";
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
        .from('keyword_trends')
        .select('keyword, category, count, last_used')
        .order('count', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching keyword analysis:', error);
        return [];
      }
      
      // Process raw data into the expected format
      const keywordMap = new Map<string, KeywordAnalysis>();
      
      for (const item of data) {
        const existing = keywordMap.get(item.keyword);
        const sentimentValue = 
          item.category === 'positive' ? 0.8 : 
          item.category === 'negative' ? 0.2 : 0.5;
          
        if (existing) {
          // Update existing entry
          const newTotal = existing.occurrence_count + item.count;
          const newSentiment = ((existing.avg_sentiment * existing.occurrence_count) + 
                               (sentimentValue * item.count)) / newTotal;
          
          // Update first/last occurrence
          const lastDate = new Date(item.last_used);
          const existingLastDate = new Date(existing.last_occurrence || "");
          const existingFirstDate = new Date(existing.first_occurrence || "");
          
          existing.occurrence_count = newTotal;
          existing.avg_sentiment = newSentiment;
          
          if (!existing.first_occurrence || lastDate < existingFirstDate) {
            existing.first_occurrence = item.last_used;
          }
          
          if (!existing.last_occurrence || lastDate > existingLastDate) {
            existing.last_occurrence = item.last_used;
          }
        } else {
          // Create new entry
          keywordMap.set(item.keyword, {
            keyword: item.keyword,
            occurrence_count: item.count,
            avg_sentiment: sentimentValue,
            first_occurrence: item.last_used,
            last_occurrence: item.last_used
          });
        }
      }
      
      // Convert Map to array and sort by occurrence count
      return Array.from(keywordMap.values())
        .sort((a, b) => b.occurrence_count - a.occurrence_count);
      
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
        category: (item.category as "positive" | "neutral" | "negative" | "general") || "neutral"
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { filters } = useSharedFilters();
  
  const fetchKeywordTrends = async () => {
    setLoading(true);
    try {
      const data = await keywordAnalysisService.getKeywordTrends();
      setKeywordTrends(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error in fetchKeywordTrends:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchKeywordTrends();
  }, [filters.dateRange]);
  
  return { keywordTrends, loading, lastUpdated, fetchKeywordTrends };
};
