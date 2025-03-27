import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamMetrics, useRepMetrics } from '@/services/RealTimeMetricsService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TeamPerformanceAnalytics = () => {
  const { metrics: teamMetrics, isLoading: isTeamLoading, error: teamError } = useTeamMetrics();
  const { metrics: repMetrics, isLoading: isRepLoading, error: repError } = useRepMetrics();

  if (isTeamLoading || isRepLoading) {
    return <div className="text-center py-4">Loading metrics...</div>;
  }

  if (teamError || repError) {
    return <div className="text-center py-4 text-red-500">Error loading metrics.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Team Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {teamMetrics && teamMetrics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamMetrics}>
                <XAxis dataKey="team_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="call_count" fill="#8884d8" name="Call Count" />
                <Bar dataKey="avg_sentiment" fill="#82ca9d" name="Avg Sentiment" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4">No team metrics available.</div>
          )}
        </CardContent>
      </Card>

      {/* Rep Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Representative Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {repMetrics && repMetrics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={repMetrics}>
                <XAxis dataKey="rep_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="call_count" fill="#d88488" name="Call Count" />
                <Bar dataKey="avg_sentiment" fill="#ca829a" name="Avg Sentiment" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4">No representative metrics available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPerformanceAnalytics;
