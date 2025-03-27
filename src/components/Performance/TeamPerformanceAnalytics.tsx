
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card } from '@/components/ui/card';
import { TeamPerformance } from '@/types/analytics';

interface TeamPerformanceAnalyticsProps {
  data: TeamPerformance[];
}

export const TeamPerformanceAnalytics: React.FC<TeamPerformanceAnalyticsProps> = ({ data }) => {
  // Prepare data in a format Recharts can use
  const chartData = data.map(member => ({
    name: member.name,
    'Call Volume': member.calls,
    'Success Rate': member.successRate,
    'Sentiment Score': parseFloat(member.avgSentiment) * 100,
    'Conversion Rate': member.conversionRate * 100
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {data.map(member => (
          <Card key={member.id} className="p-4">
            <div className="font-medium">{member.name}</div>
            <div className="text-2xl font-bold mt-1">{member.calls} calls</div>
            <div className="text-sm text-muted-foreground mt-1">
              {member.successRate}% success rate
            </div>
          </Card>
        ))}
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Call Volume" fill="#8884d8" />
          <Bar dataKey="Success Rate" fill="#82ca9d" />
          <Bar dataKey="Sentiment Score" fill="#ffc658" />
          <Bar dataKey="Conversion Rate" fill="#ff7300" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
