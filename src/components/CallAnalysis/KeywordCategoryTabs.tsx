
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KeywordCategory } from '@/hooks/useKeywordTrends';
import { Sparkles, ThumbsUp, ThumbsDown, HelpCircle, Package } from 'lucide-react';

interface KeywordCategoryTabsProps {
  activeCategory: KeywordCategory;
  onCategoryChange: (category: KeywordCategory) => void;
}

const KeywordCategoryTabs: React.FC<KeywordCategoryTabsProps> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <Tabs defaultValue={activeCategory} value={activeCategory} onValueChange={(value) => onCategoryChange(value as KeywordCategory)}>
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="all" className="text-xs flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">All</span>
        </TabsTrigger>
        <TabsTrigger value="positive" className="text-xs flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Positive</span>
        </TabsTrigger>
        <TabsTrigger value="negative" className="text-xs flex items-center gap-1">
          <ThumbsDown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Negative</span>
        </TabsTrigger>
        <TabsTrigger value="objection" className="text-xs flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Objections</span>
        </TabsTrigger>
        <TabsTrigger value="product" className="text-xs flex items-center gap-1">
          <Package className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Product</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default KeywordCategoryTabs;
