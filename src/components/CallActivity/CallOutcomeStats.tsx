
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface CallOutcomeStatsProps {
  outcomeStats?: { name: string; value: number; color: string }[];
  callDistributionData?: { name: string; value: number }[];
}

const CallOutcomeStats: React.FC<CallOutcomeStatsProps> = ({ 
  outcomeStats = [
    { name: 'Successful', value: 35, color: '#22c55e' },
    { name: 'Follow-up', value: 25, color: '#3b82f6' },
    { name: 'No sale', value: 20, color: '#f97316' },
    { name: 'Objections', value: 15, color: '#ef4444' },
    { name: 'Other', value: 5, color: '#a855f7' }
  ],
  callDistributionData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 13 },
    { name: 'Thu', value: 17 },
    { name: 'Fri', value: 21 },
    { name: 'Sat', value: 7 },
    { name: 'Sun', value: 2 }
  ]
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Call Outcomes & Distribution</CardTitle>
        <CardDescription>
          Overview of call results and daily distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-4">Call Outcomes</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={outcomeStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip 
                  formatter={(value) => [`${value} calls`, 'Count']}
                  labelFormatter={(label) => `Outcome: ${label}`}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {outcomeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-4">Daily Call Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={callDistributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} calls`, 'Count']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallOutcomeStats;
