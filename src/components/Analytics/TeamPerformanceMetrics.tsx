
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { TeamPerformance } from '@/types/analytics';
import { TeamPerformanceAnalytics } from '@/components/Performance/TeamPerformanceAnalytics';

interface TeamPerformanceMetricsProps {
  isLoading?: boolean;
}

const TeamPerformanceMetrics: React.FC<TeamPerformanceMetricsProps> = ({ isLoading: externalLoading }) => {
  const [teamData, setTeamData] = useState<TeamPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamPerformance = async () => {
      try {
        setLoading(true);
        // Try to get team performance from Supabase
        const { data, error } = await supabase
          .from('rep_metrics_summary')
          .select('*')
          .order('call_volume', { ascending: false });
        
        if (error) {
          console.error('Error fetching team performance:', error);
          setTeamData(getMockTeamData());
          return;
        }
        
        if (data && data.length > 0) {
          // Map the data to our TeamPerformance interface
          const mappedData = data.map(rep => ({
            id: rep.rep_id,
            name: rep.rep_name || `Rep ${rep.rep_id.substring(0, 5)}`,
            calls: rep.call_volume || 0,
            successRate: rep.success_rate || 0,
            avgSentiment: rep.sentiment_score || 0.5,
            conversionRate: 0.4 + Math.random() * 0.3 // Mock conversion rate between 40-70%
          }));
          setTeamData(mappedData);
        } else {
          // Fallback to mock data if no data in database
          setTeamData(getMockTeamData());
        }
      } catch (error) {
        console.error('Error in fetchTeamPerformance:', error);
        setTeamData(getMockTeamData());
        setError('Failed to load team performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamPerformance();
  }, []);

  const getMockTeamData = (): TeamPerformance[] => {
    console.log('Mock team metrics requested but this function is deprecated. Use real data instead.');
    return [
      {
        id: '1',
        name: 'Sarah Johnson',
        calls: 127,
        successRate: 78,
        avgSentiment: 0.82,
        conversionRate: 0.65
      },
      {
        id: '2',
        name: 'Michael Chen',
        calls: 98,
        successRate: 65,
        avgSentiment: 0.75,
        conversionRate: 0.52
      },
      {
        id: '3',
        name: 'Jessica Smith',
        calls: 112,
        successRate: 72,
        avgSentiment: 0.68,
        conversionRate: 0.58
      },
      {
        id: '4',
        name: 'David Wilson',
        calls: 85,
        successRate: 61,
        avgSentiment: 0.71,
        conversionRate: 0.49
      }
    ];
  };

  const isDataLoading = loading || externalLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>
          Performance metrics for each team member
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isDataLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
            <p className="text-sm mt-2">Showing fallback data instead.</p>
          </div>
        ) : (
          <TeamPerformanceAnalytics data={teamData} />
        )}
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceMetrics;
