
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from 'lucide-react';
import { useKeywordTrends, KeywordCategory } from '@/hooks/useKeywordTrends';
import KeywordChart from './KeywordChart';
import KeywordCategoryTabs from './KeywordCategoryTabs';
import { Button } from '@/components/ui/button';

const KeywordTrendsChart = () => {
  // Get keyword trends data using the custom hook
  const { keywords, keywordTrends, lastUpdated, fetchKeywordTrends, isLoading } = useKeywordTrends();
  const [activeCategory, setActiveCategory] = useState<KeywordCategory>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchKeywordTrends();
    setTimeout(() => setIsRefreshing(false), 800); // Add a slight delay for better UX
  };
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Keyword Trends</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {getLastUpdatedText()}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <KeywordCategoryTabs 
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            
            {currentKeywords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p>No keywords found for this category</p>
                <p className="text-sm mt-2">Try another category or add new keywords</p>
              </div>
            ) : (
              <div className="transition-all duration-300">
                <KeywordChart 
                  keywords={currentKeywords}
                  category={activeCategory}
                  isLoading={false}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(KeywordTrendsChart);
