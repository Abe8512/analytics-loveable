
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export const SentimentTrendsChart: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchSentimentTrends = async () => {
      setLoading(true);
      try {
        // Get sentiment trends from sentiment_trends table
        const { data, error } = await supabase
          .from('sentiment_trends')
          .select('*')
          .order('recorded_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching sentiment trends:', error);
          return;
        }
        
        // Process data for visualization
        const processed = processChartData(data || []);
        setTrendData(processed);
      } catch (err) {
        console.error('Error in fetchSentimentTrends:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSentimentTrends();
  }, []);
  
  // Process the raw sentiment data for the chart
  const processChartData = (data: any[]) => {
    const dateMap = new Map<string, { positive: number, neutral: number, negative: number }>();
    
    data.forEach(item => {
      if (!item.recorded_at || !item.sentiment_label) return;
      
      const date = new Date(item.recorded_at).toISOString().split('T')[0];
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { positive: 0, neutral: 0, negative: 0 });
      }
      
      const entry = dateMap.get(date)!;
      if (item.sentiment_label === 'positive') entry.positive++;
      else if (item.sentiment_label === 'negative') entry.negative++;
      else entry.neutral++;
    });
    
    // Convert to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  };
  
  // Colors for the chart
  const SENTIMENT_COLORS = {
    positive: '#10B981',
    neutral: '#3B82F6',
    negative: '#EF4444'
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Trends</CardTitle>
        <CardDescription>How sentiment has changed over time</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="positive" 
                name="Positive" 
                stroke={SENTIMENT_COLORS.positive} 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="neutral" 
                name="Neutral" 
                stroke={SENTIMENT_COLORS.neutral} 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="negative" 
                name="Negative" 
                stroke={SENTIMENT_COLORS.negative} 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-[300px]">
            <p className="text-muted-foreground">No sentiment data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentTrendsChart;
