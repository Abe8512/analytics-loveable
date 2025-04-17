
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { KeywordCategory } from '@/hooks/useKeywordTrends';
import { Skeleton } from '@/components/ui/skeleton';

interface KeywordChartProps {
  keywords: Array<{
    keyword: string;
    count: number;
    trend?: number;
    category?: string;
  }>;
  category: KeywordCategory;
  isLoading: boolean;
}

const KeywordChart: React.FC<KeywordChartProps> = ({ keywords, category, isLoading }) => {
  // Only show top 10 keywords
  const chartData = keywords.slice(0, 10);
  
  // Get color based on category
  const getCategoryColor = (category: KeywordCategory) => {
    switch (category) {
      case 'positive':
        return '#10B981'; // green
      case 'negative':
        return '#EF4444'; // red
      case 'neutral':
        return '#3B82F6'; // blue
      case 'general':
        return '#8884d8'; // purple
      default:
        return '#8884d8'; // purple for 'all'
    }
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2">
          <p className="font-medium">{label}</p>
          <p className="text-sm">Count: {payload[0].value}</p>
          {payload[0].payload.trend && (
            <p className="text-xs text-muted-foreground">
              Trend: {payload[0].payload.trend > 0 ? '↑' : payload[0].payload.trend < 0 ? '↓' : '→'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return <Skeleton className="w-full h-64" />;
  }
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No keywords found for this category</p>
      </div>
    );
  }
  
  const barColor = getCategoryColor(category);
  
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={chartData.sort((a, b) => b.count - a.count)}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis 
          dataKey="keyword" 
          type="category" 
          width={120}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill={barColor}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={barColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default KeywordChart;
