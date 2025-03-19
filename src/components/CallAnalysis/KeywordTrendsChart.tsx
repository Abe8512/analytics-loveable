
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKeywordTrends, KeywordCategory } from '@/hooks/useKeywordTrends';
import KeywordChart from './KeywordChart';
import KeywordCategoryTabs from './KeywordCategoryTabs';
import { toast } from 'sonner';

const KeywordTrendsChart = () => {
  // Get keyword trends data using the custom hook
  const { isLoading, keywordTrends, fetchKeywordTrends, lastUpdated } = useKeywordTrends();
  const [activeCategory, setActiveCategory] = useState<KeywordCategory>('positive');
  const [refreshing, setRefreshing] = useState(false);
  
  // Get the current keywords based on active category
  const currentKeywords = keywordTrends[activeCategory] || [];
  
  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchKeywordTrends();
      toast.success('Keyword trends refreshed');
    } catch (error) {
      toast.error('Failed to refresh trends');
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return 'Never updated';
    
    // Format the date to a readable format
    return `Last updated: ${lastUpdated.toLocaleTimeString()}`;
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Keyword Trends</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {getLastUpdatedText()}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isLoading || refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <KeywordCategoryTabs 
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            
            <KeywordChart 
              keywords={currentKeywords}
              category={activeCategory}
              isLoading={refreshing}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordTrendsChart;
