
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AdvancedMetricsService, AdvancedMetric } from '@/services/AdvancedMetricsService';
import { Skeleton } from '@/components/ui/skeleton';

interface AdvancedMetricsChartProps {
  period?: 'day' | 'week' | 'month' | 'year';
  groupBy?: 'day' | 'week' | 'month';
}

export const AdvancedMetricsChart: React.FC<AdvancedMetricsChartProps> = ({ 
  period = 'month',
  groupBy = 'month'
}) => {
  const [data, setData] = useState<AdvancedMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const metrics = await AdvancedMetricsService.getAdvancedMetrics({
          period,
          groupBy
        });
        setData(metrics);
        setError(null);
      } catch (err) {
        console.error('Error fetching advanced metrics data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, groupBy]);

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (error) {
    return <div className="text-center py-10 text-muted-foreground">Error loading metrics data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'callVolume') return [value, 'Call Volume'];
            if (name === 'sentiment') return [value, 'Sentiment Score'];
            if (name === 'conversion') return [`${value}%`, 'Conversion Rate'];
            return [value, name];
          }}
        />
        <Legend />
        <Bar dataKey="callVolume" fill="#8884d8" name="Call Volume" />
        <Bar dataKey="sentiment" fill="#82ca9d" name="Sentiment Score" />
        <Bar dataKey="conversion" fill="#ffc658" name="Conversion Rate" />
      </BarChart>
    </ResponsiveContainer>
  );
};
