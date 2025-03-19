
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useKeywordTrends, KeywordCategory } from '@/hooks/useKeywordTrends';
import KeywordChart from './KeywordChart';
import KeywordCategoryTabs from './KeywordCategoryTabs';

const KeywordTrendsChart = () => {
  // Get keyword trends data using the custom hook
  const { isLoading, keywordTrends, lastUpdated } = useKeywordTrends();
  const [activeCategory, setActiveCategory] = useState<KeywordCategory>('all');
  
  // Get the current keywords based on active category
  const currentKeywords = useMemo(() => 
    keywordTrends[activeCategory] || [], 
    [keywordTrends, activeCategory]
  );
  
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
              isLoading={false}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(KeywordTrendsChart);
