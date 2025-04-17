
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KeywordCategory } from '@/hooks/useKeywordTrends';
import { TagIcon, Smile, Meh, Frown, Layers } from 'lucide-react';

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
      value={activeCategory} 
      onValueChange={(value) => onCategoryChange(value as KeywordCategory)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all" className="flex items-center gap-1">
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">All</span>
        </TabsTrigger>
        <TabsTrigger value="positive" className="flex items-center gap-1">
          <Smile className="h-4 w-4" />
          <span className="hidden sm:inline">Positive</span>
        </TabsTrigger>
        <TabsTrigger value="neutral" className="flex items-center gap-1">
          <Meh className="h-4 w-4" />
          <span className="hidden sm:inline">Neutral</span>
        </TabsTrigger>
        <TabsTrigger value="negative" className="flex items-center gap-1">
          <Frown className="h-4 w-4" />
          <span className="hidden sm:inline">Negative</span>
        </TabsTrigger>
        <TabsTrigger value="general" className="flex items-center gap-1">
          <TagIcon className="h-4 w-4" />
          <span className="hidden sm:inline">General</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default KeywordCategoryTabs;
