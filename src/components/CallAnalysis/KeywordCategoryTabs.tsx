
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeywordCategory } from '@/hooks/useKeywordTrends';
import { Sparkles, ThumbsUp, MinusCircle, ThumbsDown } from 'lucide-react';

interface KeywordCategoryTabsProps {
  activeCategory: KeywordCategory;
  onCategoryChange: (category: KeywordCategory) => void;
}

const KeywordCategoryTabs: React.FC<KeywordCategoryTabsProps> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <Tabs 
      defaultValue={activeCategory} 
      value={activeCategory}
      onValueChange={(value) => onCategoryChange(value as KeywordCategory)}
      className="mb-4"
    >
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="positive" className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" />
          <span>Positive</span>
        </TabsTrigger>
        <TabsTrigger value="neutral" className="flex items-center gap-1">
          <MinusCircle className="h-4 w-4" />
          <span>Neutral</span>
        </TabsTrigger>
        <TabsTrigger value="negative" className="flex items-center gap-1">
          <ThumbsDown className="h-4 w-4" />
          <span>Negative</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default KeywordCategoryTabs;
