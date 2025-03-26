
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useSharedFilters } from "@/contexts/SharedFilterContext";

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface SentimentAnalysis {
  sentiment_label: SentimentLabel;
  confidence: number;
  text_segment?: string;
}

export interface SentimentTrend {
  id: string;
  sentiment_label: SentimentLabel;
  confidence: number;
  user_id: string;
  recorded_at: string;
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
  date?: string;
}

export class SentimentAnalysisService {
  public async getSentimentTrends(): Promise<SentimentTrend[]> {
    try {
      const { data, error } = await supabase
        .from('sentiment_trends')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching sentiment trends:', error);
        return [];
      }
      
      // Ensure sentiment_label is always of type SentimentLabel
      const typedData = data.map(item => ({
        ...item,
        sentiment_label: this.validateSentimentLabel(item.sentiment_label)
      }));
      
      return typedData;
    } catch (error) {
      console.error('Exception in getSentimentTrends:', error);
      return [];
    }
  }
  
  private validateSentimentLabel(label: string): SentimentLabel {
    const validLabels: SentimentLabel[] = ["positive", "neutral", "negative"];
    return validLabels.includes(label as SentimentLabel) 
      ? (label as SentimentLabel) 
      : "neutral";
  }
  
  public analyzeSentiment(text: string): SentimentLabel {
    // This is a simple placeholder implementation
    // In a real app, this would call an NLP service or ML model
    if (!text) return "neutral";
    
    const lowerText = text.toLowerCase();
    const positiveWords = ['great', 'excellent', 'awesome', 'good', 'happy', 'pleased', 'thank'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'unhappy', 'disappointed', 'issue', 'problem'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'g');
      const matches = lowerText.match(regex);
      if (matches) positiveScore += matches.length;
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'g');
      const matches = lowerText.match(regex);
      if (matches) negativeScore += matches.length;
    });
    
    if (positiveScore > negativeScore + 1) return "positive";
    if (negativeScore > positiveScore + 1) return "negative";
    return "neutral";
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService();

export const useSentimentTrends = () => {
  const [sentimentTrends, setSentimentTrends] = useState<SentimentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const { filters } = useSharedFilters();
  
  useEffect(() => {
    const fetchSentimentTrends = async () => {
      setLoading(true);
      try {
        const data = await sentimentAnalysisService.getSentimentTrends();
        setSentimentTrends(data);
      } catch (error) {
        console.error('Error in useSentimentTrends:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSentimentTrends();
  }, [filters.dateRange]);
  
  return { sentimentTrends, loading };
};
