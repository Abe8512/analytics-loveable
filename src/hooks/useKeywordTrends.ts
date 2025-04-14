
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Update type definition to include 'all' and 'general'
export type KeywordCategory = 'all' | 'positive' | 'neutral' | 'negative' | 'general';

export interface KeywordTrend {
  id: string;
  keyword: string;
  category: KeywordCategory;
  count: number;
  last_used: string;
}

export interface GroupedKeywords {
  all: KeywordTrend[];
  positive: KeywordTrend[];
  neutral: KeywordTrend[];
  negative: KeywordTrend[];
  general: KeywordTrend[];
}

export function useKeywordTrends() {
  const [isLoading, setIsLoading] = useState(true);
  const [keywordTrends, setKeywordTrends] = useState<GroupedKeywords>({
    all: [],
    positive: [],
    neutral: [],
    negative: [],
    general: []
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const fetchKeywordTrends = useCallback(async () => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try to fetch from keyword_trends first
      let data;
      let error;
      
      try {
        const result = await supabase
          .from('keyword_trends')
          .select('*')
          .order('count', { ascending: false });
        
        data = result.data;
        error = result.error;
      } catch (e) {
        console.error('Error fetching from keyword_trends, will try fallback:', e);
        error = e;
      }
      
      // If that fails, try the fallback table
      if (error || !data || data.length === 0) {
        console.log('Using keyword_analytics fallback table');
        const fallbackResult = await supabase
          .from('keyword_analytics')
          .select('*')
          .order('count', { ascending: false });
          
        data = fallbackResult.data;
        error = fallbackResult.error;
      }
          
      if (error) {
        console.error('Error fetching keyword trends from all sources:', error);
        toast.error('Failed to load keyword trends');
        return;
      }
      
      // Group keywords by category and ensure correct types
      const grouped: GroupedKeywords = {
        all: [],
        positive: [],
        neutral: [],
        negative: [],
        general: []
      };
      
      if (data) {
        // Create a collection of all keywords first
        const allKeywords: KeywordTrend[] = [];
        
        data.forEach(item => {
          // Skip items with null or invalid data
          if (!item || !item.keyword || !item.category) return;
          
          // Make sure category is valid
          const category = (item.category as KeywordCategory);
          if (category === 'positive' || category === 'neutral' || category === 'negative' || category === 'general') {
            const keywordItem: KeywordTrend = {
              id: item.id,
              keyword: item.keyword,
              category,
              count: item.count || 1,
              last_used: item.last_used || new Date().toISOString()
            };
            
            // Add to the appropriate category
            if (grouped[category]) {
              grouped[category].push(keywordItem);
            } else {
              // Default to general if somehow category is unrecognized
              grouped.general.push({...keywordItem, category: 'general'});
            }
            
            // Also add to the 'all' category
            allKeywords.push(keywordItem);
          }
        });
        
        // Sort all keywords by count and add to the 'all' category
        grouped.all = allKeywords.sort((a, b) => b.count - a.count);
      }
      
      setKeywordTrends(grouped);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error in fetchKeywordTrends:', error);
      toast.error('Failed to load keyword trends');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Setup initial fetch and subscription for real-time updates
  useEffect(() => {
    fetchKeywordTrends();
    
    // Set up real-time subscription with proper cleanup
    const channel = supabase
      .channel('keyword-trends-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'keyword_trends' },
        () => {
          console.log('Real-time keyword trends update received');
          fetchKeywordTrends();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to keyword_trends table');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to keyword_trends table');
        }
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchKeywordTrends]);
  
  // Function to save a keyword to the database with proper error handling and type safety
  const saveKeyword = async (keyword: string, category: Exclude<KeywordCategory, 'all'>) => {
    if (!keyword || !category) {
      console.error('Invalid keyword or category');
      return;
    }
    
    try {
      // Check if keyword in this category already exists
      const { data: existingKeyword, error: checkError } = await supabase
        .from('keyword_trends')
        .select('*')
        .eq('keyword', keyword)
        .eq('category', category)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing keyword:', checkError);
        return;
      }
      
      const now = new Date().toISOString();
      
      if (existingKeyword) {
        // Update existing keyword with incremented count
        const { error: updateError } = await supabase
          .from('keyword_trends')
          .update({
            count: (existingKeyword.count || 1) + 1,
            last_used: now
          })
          .eq('id', existingKeyword.id);
          
        if (updateError) {
          console.error('Error updating keyword count:', updateError);
        }
      } else {
        // Insert new keyword
        const { error: insertError } = await supabase
          .from('keyword_trends')
          .insert({
            keyword,
            category,
            count: 1,
            last_used: now
          });
          
        if (insertError) {
          console.error('Error saving new keyword:', insertError);
        }
      }
      
      // Refresh data after insert/update
      fetchKeywordTrends();
    } catch (error) {
      console.error('Error in saveKeyword:', error);
    }
  };

  return {
    isLoading,
    keywordTrends,
    saveKeyword,
    fetchKeywordTrends,
    lastUpdated
  };
}
