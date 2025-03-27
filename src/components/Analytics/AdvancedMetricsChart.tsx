
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Mock data - in a real application, this would come from your API
const data = [
  { name: 'Jan', callVolume: 120, sentiment: 72, conversion: 28 },
  { name: 'Feb', callVolume: 132, sentiment: 68, conversion: 32 },
  { name: 'Mar', callVolume: 141, sentiment: 75, conversion: 35 },
  { name: 'Apr', callVolume: 128, sentiment: 79, conversion: 30 },
  { name: 'May', callVolume: 155, sentiment: 82, conversion: 38 },
  { name: 'Jun', callVolume: 165, sentiment: 78, conversion: 42 },
];

export const AdvancedMetricsChart = () => {
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
