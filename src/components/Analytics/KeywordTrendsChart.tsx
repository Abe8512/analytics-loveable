
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { useKeywordTrends } from '@/hooks/useKeywordTrends';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const KeywordTrendsChart: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'general'>('all');
  const { keywords, keywordTrends, isLoading } = useKeywordTrends();
  
  // Process data for chart display
  const chartData = keywordTrends[activeCategory]
    ?.slice(0, 10)
    .map(trend => ({
      keyword: trend.keyword,
      count: trend.count
    }))
    .sort((a, b) => b.count - a.count);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Trends</CardTitle>
        <CardDescription>Most frequent keywords by sentiment category</CardDescription>
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="positive">Positive</TabsTrigger>
            <TabsTrigger value="neutral">Neutral</TabsTrigger>
            <TabsTrigger value="negative">Negative</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="keyword" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Occurrences" 
                fill={
                  activeCategory === 'positive' ? '#10B981' : 
                  activeCategory === 'negative' ? '#EF4444' : 
                  activeCategory === 'neutral' ? '#3B82F6' : 
                  activeCategory === 'general' ? '#8884d8' : '#8884d8'
                } 
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-muted-foreground">No keyword data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordTrendsChart;
