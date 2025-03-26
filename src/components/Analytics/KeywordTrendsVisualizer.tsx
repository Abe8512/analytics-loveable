
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeywordAnalysis } from '@/services/KeywordAnalysisService';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { MessageSquare, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface KeywordTrendsVisualizerProps {
  keywords: KeywordAnalysis[];
  loading: boolean;
}

const KeywordTrendsVisualizer: React.FC<KeywordTrendsVisualizerProps> = ({ 
  keywords, 
  loading 
}) => {
  // Format the data for bar chart
  const barChartData = keywords.slice(0, 10).map(item => ({
    keyword: item.keyword,
    count: item.occurrence_count,
    sentiment: parseFloat((item.avg_sentiment * 100).toFixed(1)),
    first_occurrence: item.first_occurrence
  }));
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value}{entry.name === 'Sentiment' ? '%' : ''}
            </p>
          ))}
          {payload[0]?.payload?.first_occurrence && (
            <p className="text-xs text-muted-foreground mt-1">
              First seen: {format(parseISO(payload[0].payload.first_occurrence), 'MMM dd, yyyy')}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Get color based on sentiment
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return '#22c55e'; // green
    if (sentiment <= 40) return '#ef4444'; // red
    return '#3b82f6'; // blue
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Keyword Analysis
        </CardTitle>
        <CardDescription>
          Most frequent keywords and their sentiment context
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="keyword" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Occurrences" 
                    fill="#8884d8"
                  >
                    {barChartData.map((entry, index) => (
                      <Cell 
                        key={`count-${index}`}
                        fill={getSentimentColor(entry.sentiment)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {keywords.slice(0, 15).map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="px-3 py-1 flex items-center gap-1"
                  style={{ color: getSentimentColor(keyword.avg_sentiment * 100) }}
                >
                  <MessageSquare className="h-3 w-3" />
                  {keyword.keyword}
                  <span className="text-xs ml-1">({keyword.occurrence_count})</span>
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(KeywordTrendsVisualizer);
