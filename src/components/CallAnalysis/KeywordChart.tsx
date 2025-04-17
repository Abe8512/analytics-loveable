
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { KeywordCategory } from '@/hooks/useKeywordTrends';

interface KeywordTrend {
  keyword: string;
  occurrences: number;
  change: number;
  category: KeywordCategory;
}

interface KeywordChartProps {
  keywords: KeywordTrend[];
  category: KeywordCategory;
  isLoading: boolean;
}

const KeywordChart: React.FC<KeywordChartProps> = ({ keywords, category, isLoading }) => {
  // Transform keywords for display in chart
  const chartData = keywords.map(k => ({
    name: k.keyword,
    value: k.occurrences,
    change: k.change
  }));
  
  // Define color based on category
  const getCategoryColor = () => {
    switch (category) {
      case 'positive':
        return '#10b981';
      case 'negative':
        return '#ef4444';
      case 'objection':
        return '#f59e0b';
      case 'product':
        return '#3b82f6';
      default:
        return '#8884d8';
    }
  };
  
  return (
    <div className="w-full h-64">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
          >
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={60}
              interval={0}
              fontSize={12}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [value, 'Occurrences']}
              labelFormatter={(label) => `Keyword: ${label}`}
            />
            <Bar dataKey="value" fill={getCategoryColor()} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default KeywordChart;
