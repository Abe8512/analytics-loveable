
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { OverviewCard } from '@/components/ui/cards';
import { AnalyticsService } from '@/services/AnalyticsService';
import { TeamPerformance } from '@/types/analytics';
import { TeamPerformanceAnalytics } from '@/components/Performance/TeamPerformanceAnalytics';
import { supabase } from '@/integrations/supabase/client';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [teamData, setTeamData] = useState<TeamPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use the AnalyticsService to get data
        const data = await AnalyticsService.getAnalyticsData();
        setAnalyticsData(data);

        // Fetch team performance data
        const teamPerformanceData = await fetchTeamPerformance();
        setTeamData(teamPerformanceData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTeamPerformance = async (): Promise<TeamPerformance[]> => {
    try {
      // Try to get team performance from Supabase
      const { data, error } = await supabase
        .from('rep_metrics_summary')
        .select('*')
        .order('call_volume', { ascending: false });
      
      if (error) {
        console.error('Error fetching team performance:', error);
        return getMockTeamData();
      }
      
      if (data && data.length > 0) {
        // Map the data to our TeamPerformance interface
        return data.map(rep => ({
          id: rep.rep_id,
          name: rep.rep_name || `Rep ${rep.rep_id.substring(0, 5)}`,
          calls: rep.call_volume || 0,
          successRate: rep.success_rate || 0,
          avgSentiment: rep.sentiment_score || 0.5, // Make sure this is a number
          conversionRate: 0.4 + Math.random() * 0.3 // Mock conversion rate between 40-70%
        }));
      }
      
      // Fallback to mock data if no data in database
      return getMockTeamData();
    } catch (error) {
      console.error('Error in fetchTeamPerformance:', error);
      return getMockTeamData();
    }
  };

  const getMockTeamData = (): TeamPerformance[] => {
    return [
      {
        id: '1',
        name: 'Sarah Johnson',
        calls: 127,
        successRate: 78,
        avgSentiment: 0.82, // Number instead of string
        conversionRate: 0.65
      },
      {
        id: '2',
        name: 'Michael Chen',
        calls: 98,
        successRate: 65,
        avgSentiment: 0.75, // Number instead of string
        conversionRate: 0.52
      },
      {
        id: '3',
        name: 'Jessica Smith',
        calls: 112,
        successRate: 72,
        avgSentiment: 0.68, // Number instead of string
        conversionRate: 0.58
      },
      {
        id: '4',
        name: 'David Wilson',
        calls: 85,
        successRate: 61,
        avgSentiment: 0.71, // Number instead of string
        conversionRate: 0.49
      }
    ];
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <PageHeader 
          title="Analytics" 
          subtitle="Detailed performance metrics and team insights"
        />
        
        <div className="grid gap-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard 
              title="Total Calls" 
              value={analyticsData?.totalCalls || "324"}
              trend={12}
              trendDirection="up"
            />
            <OverviewCard 
              title="Avg. Call Duration" 
              value={analyticsData?.avgDuration || "4:32"}
              trend={8}
              trendDirection="down"
            />
            <OverviewCard 
              title="Conversion Rate" 
              value={analyticsData?.conversionRate || "48%"}
              trend={3}
              trendDirection="up"
            />
            <OverviewCard 
              title="Sentiment Score" 
              value={analyticsData?.sentimentScore || "72/100"}
              trend={5}
              trendDirection="up"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : (
                <TeamPerformanceAnalytics data={teamData} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
