
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeam } from '@/contexts/TeamContext';
import { useMetrics } from '@/contexts/MetricsContext';
import { TeamPerformance } from '@/types/teamTypes';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

const TeamPerformanceMetricsCard = () => {
  const { teamMembers, isLoading: isTeamLoading } = useTeam();
  const { metricsData, isLoading: isMetricsLoading } = useMetrics();
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  
  // Combine team data with metrics
  useEffect(() => {
    if (!teamMembers.length || isMetricsLoading) return;
    
    // Create performance data for each team member
    // In a real app, this would come from the API
    const performance: TeamPerformance[] = teamMembers.map((member, index) => ({
      id: member.id,
      name: member.name,
      rep_id: member.id,
      rep_name: member.name,
      active_reps: 1,
      total_calls: Math.floor(Math.random() * 50) + 10,
      calls: Math.floor(Math.random() * 50) + 10,
      call_volume: Math.floor(Math.random() * 50) + 10,
      avg_duration: Math.floor(Math.random() * 300) + 60,
      avg_call_duration: Math.floor(Math.random() * 300) + 60,
      avg_sentiment: (Math.random() * 0.5) + 0.5,
      sentiment_score: (Math.random() * 0.5) + 0.5,
      positive_calls: Math.floor(Math.random() * 30) + 5,
      negative_calls: Math.floor(Math.random() * 10) + 1,
      success_rate: Math.floor(Math.random() * 40) + 60,
      successRate: Math.floor(Math.random() * 40) + 60,
      conversionRate: Math.floor(Math.random() * 20) + 10,
      avg_talk_ratio: Math.floor(Math.random() * 30) + 35,
      objection_handling_score: Math.floor(Math.random() * 40) + 60,
      positive_language_score: Math.floor(Math.random() * 40) + 60,
    }));
    
    setTeamPerformance(performance);
  }, [teamMembers, isMetricsLoading, metricsData]);
  
  const isLoading = isTeamLoading || isMetricsLoading;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Format data for chart
  const chartData = teamPerformance.map(member => ({
    name: member.rep_name || member.name || 'Unknown',
    'Call Volume': member.call_volume || member.calls || 0,
    'Success Rate': member.success_rate || member.successRate || 0,
    'Sentiment': Math.round(((member.sentiment_score || member.avg_sentiment || 0.5) * 100)),
    'Conversion': member.conversionRate || 0
  }));
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>Performance metrics across team members</CardDescription>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No team members available.</p>
            <p className="text-sm mt-2">Add team members on the Team page to see performance metrics.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Call Volume" fill="#8884d8" />
              <Bar dataKey="Success Rate" fill="#82ca9d" />
              <Bar dataKey="Sentiment" fill="#ffc658" />
              <Bar dataKey="Conversion" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceMetricsCard;
