
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KeywordTrend, KeywordCategory } from '@/hooks/useKeywordTrends';
import { Skeleton } from '@/components/ui/skeleton';

interface KeywordChartProps {
  keywords: KeywordTrend[];
  category: KeywordCategory;
  isLoading?: boolean;
}

const KeywordChart: React.FC<KeywordChartProps> = ({ keywords, category, isLoading = false }) => {
  // Get color based on category
  const getCategoryColor = (cat: KeywordCategory): string => {
    switch (cat) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#3B82F6';
    }
  };
  
  // Memoize the chart data preparation to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!Array.isArray(keywords)) return [];
    
    // Sort by count (highest first) and limit to top 10
    return [...keywords]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [keywords]);

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">No keyword data available yet. Complete a call to see trends.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="keyword" 
          angle={-45} 
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`${value} mentions`, 'Frequency']}
          labelFormatter={(label) => `Keyword: ${label}`}
        />
        <Legend />
        <Bar 
          dataKey="count" 
          name="Frequency" 
          fill={getCategoryColor(category)}
          animationDuration={500}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default KeywordChart;
