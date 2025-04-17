
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateMockChartData } from '@/services/MockDataService';

export const AdvancedMetricsChart = () => {
  const [chartType, setChartType] = useState<'bar' | 'area' | 'line'>('bar');
  const [metricType, setMetricType] = useState<'callVolume' | 'sentiment' | 'conversion'>('callVolume');
  
  // Get mock data for the chart
  const chartData = generateMockChartData();
  
  // Extract talk ratio data for visualization
  const data = chartData.talkRatioData.map(item => ({
    name: item.name,
    callVolume: item.agent * 2, // Simulating call volume data
    sentiment: item.customer / 100, // Simulating sentiment data (0-1 range)
    conversion: (item.agent + item.customer) / 200 * 100 // Simulating conversion rate
  }));
  
  // Chart configuration
  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={metricType} 
              stroke="#8884d8" 
              fill="#8884d8" 
              name={getMetricLabel()} 
            />
          </AreaChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={metricType} 
              stroke="#8884d8" 
              name={getMetricLabel()} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        );
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey={metricType} 
              fill="#8884d8" 
              name={getMetricLabel()} 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
    }
  };
  
  const getMetricLabel = () => {
    switch (metricType) {
      case 'callVolume': 
        return 'Call Volume';
      case 'sentiment': 
        return 'Sentiment Score';
      case 'conversion': 
        return 'Conversion Rate (%)';
      default: 
        return '';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Tabs value={metricType} onValueChange={(v) => setMetricType(v as any)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="callVolume">Call Volume</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Tabs value={chartType} onValueChange={(v) => setChartType(v as any)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
