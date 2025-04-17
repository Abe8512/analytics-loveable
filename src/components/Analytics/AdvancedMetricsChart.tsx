
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChartComponent } from '@/components/ui/charts';
import { useMetrics } from '@/contexts/MetricsContext';

export const AdvancedMetricsChart = () => {
  const { metricsData, isLoading } = useMetrics();
  
  // Generate mock data for the chart
  const generateChartData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate some realistic-looking data with small random variations
      const baseScore = metricsData?.callScore || 70;
      const baseSentiment = metricsData?.avgSentiment || 0.65;
      
      // Add some random fluctuations to make the chart interesting
      const dayData = {
        date: date.toISOString().substring(0, 10),
        callScore: Math.max(0, Math.min(100, baseScore + (Math.random() * 10 - 5))),
        sentiment: Math.max(0, Math.min(1, baseSentiment + (Math.random() * 0.1 - 0.05))),
        conversion: Math.max(0, Math.min(1, (metricsData?.conversionRate || 50) / 100 + (Math.random() * 0.06 - 0.03)))
      };
      
      data.push(dayData);
    }
    
    return data;
  };
  
  const chartData = generateChartData();

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <AreaChartComponent 
          data={chartData}
          xKey="date"
          areas={[
            { key: 'callScore', color: '#8884d8', name: 'Call Score' },
            { key: 'sentiment', color: '#82ca9d', name: 'Sentiment (x100)' },
            { key: 'conversion', color: '#ffc658', name: 'Conversion Rate (x100)' }
          ]}
          height={350}
        />
      )}
    </div>
  );
};
