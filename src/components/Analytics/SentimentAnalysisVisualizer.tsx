
import React, { memo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { SentimentTrendsData } from '@/services/SentimentAnalysisService';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SentimentAnalysisVisualizerProps {
  trendsByDay: SentimentTrendsData[];
  loading: boolean;
}

const COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#3b82f6',
  agent: '#8884d8',
  customer: '#82ca9d'
};

const SentimentAnalysisVisualizer: React.FC<SentimentAnalysisVisualizerProps> = ({ 
  trendsByDay, 
  loading 
}) => {
  const [activeTab, setActiveTab] = useState('trend');
  
  // Format the data for trend line chart
  const lineChartData = trendsByDay.map(item => ({
    date: format(parseISO(item.date), 'MMM dd'),
    agentSentiment: parseFloat((item.avg_agent_sentiment * 100).toFixed(1)),
    customerSentiment: parseFloat((item.avg_customer_sentiment * 100).toFixed(1)),
    calls: item.total_calls
  })).reverse();
  
  // Format data for sentiment distribution pie chart
  const calculateTotals = () => {
    const totals = trendsByDay.reduce((acc, day) => {
      acc.positive += day.positive_agent_calls;
      acc.negative += day.negative_agent_calls;
      acc.neutral += day.total_calls - (day.positive_agent_calls + day.negative_agent_calls);
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });
    
    return [
      { name: 'Positive', value: totals.positive },
      { name: 'Neutral', value: totals.neutral },
      { name: 'Negative', value: totals.negative }
    ];
  };
  
  const pieData = calculateTotals();
  
  // Format data for comparison bar chart
  const barChartData = trendsByDay.slice(0, 7).map(item => ({
    date: format(parseISO(item.date), 'MMM dd'),
    positive: item.positive_agent_calls,
    negative: item.negative_agent_calls
  })).reverse();
  
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value}{entry.name.includes('Sentiment') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Sentiment Analysis
        </CardTitle>
        <CardDescription>
          Sentiment trends across customer and agent interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trend" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="trend">Sentiment Trend</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="comparison">Positive vs Negative</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trend">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" label={{ value: 'Sentiment (%)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Calls', angle: 90, position: 'insideRight' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="agentSentiment" 
                    name="Agent Sentiment" 
                    stroke={COLORS.agent} 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="customerSentiment" 
                    name="Customer Sentiment" 
                    stroke={COLORS.customer} 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="calls" 
                    name="Call Volume" 
                    stroke="#ff7300" 
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          
          <TabsContent value="distribution">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Positive' ? COLORS.positive :
                          entry.name === 'Negative' ? COLORS.negative :
                          COLORS.neutral
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          
          <TabsContent value="comparison">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Number of Calls', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="positive" 
                    name="Positive Calls" 
                    fill={COLORS.positive}
                    stackId="a"
                  >
                    {barChartData.map((entry, index) => (
                      <Cell 
                        key={`positive-${index}`}
                        fill={COLORS.positive}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="negative" 
                    name="Negative Calls" 
                    fill={COLORS.negative}
                    stackId="a"
                  >
                    {barChartData.map((entry, index) => (
                      <Cell 
                        key={`negative-${index}`}
                        fill={COLORS.negative}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center justify-around mt-4 text-sm">
          <div className="flex items-center gap-1 text-green-500">
            <ThumbsUp className="h-4 w-4" />
            <span>Positive sentiment indicates successful interactions</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <ThumbsDown className="h-4 w-4" />
            <span>Negative sentiment may require follow-up</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(SentimentAnalysisVisualizer);
