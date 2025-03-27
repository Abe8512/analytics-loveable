
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface SentimentAnalysisProps {
  transcript?: any;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ transcript }) => {
  // Default sentiment data (can be overridden by transcript)
  const data = [
    { name: 'Positive', value: 55, color: '#22c55e' },
    { name: 'Neutral', value: 30, color: '#64748b' },
    { name: 'Negative', value: 15, color: '#ef4444' },
  ];

  // If transcript exists and has sentiment data, use it
  const renderData = transcript?.sentiment_data || data;

  return (
    <div className="h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={60}>
        <PieChart>
          <Pie
            data={renderData}
            cx="50%"
            cy="50%"
            innerRadius={15}
            outerRadius={25}
            paddingAngle={5}
            dataKey="value"
          >
            {renderData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend 
            layout="horizontal" 
            verticalAlign="middle" 
            align="right"
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentAnalysis;
