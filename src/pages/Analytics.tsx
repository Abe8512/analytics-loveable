
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { OverviewCard } from "@/components/ui/cards";
import { BarChart } from "@/components/ui/charts";
import { LineChart } from "@/components/ui/charts";
import { AreaChart } from "@/components/ui/charts";
import { PieChart } from "@/components/ui/charts";
import { TeamPerformanceAnalytics } from "@/components/Performance/TeamPerformanceAnalytics";
import {
  Phone,
  Clock,
  ThumbsUp,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import {
  AnalyticsData,
  getTeamMetrics,
  getRepMetrics
} from '@/services/AnalyticsService';
import { TeamPerformance } from '@/types/analytics';

interface TeamMetricsData {
  members: TeamPerformance[];
  avgCalls: number;
  avgSuccessRate: number;
  avgSentiment: number;
}

interface RepMetricsData {
  id: string;
  name: string;
  calls: number;
  successRate: number;
  sentiment: number;
  keywords: string[];
}

// Helper function to get mock analytics data
const getAnalyticsData = async (): Promise<AnalyticsData> => {
  // This would normally be an API call, but we'll use mock data for now
  const mockData: AnalyticsData = {
    totalCalls: 184,
    avgDuration: 420, // 7 minutes in seconds
    positiveSentiment: 120,
    negativeSentiment: 25,
    neutralSentiment: 39,
    callsPerDay: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 20 + Math.floor(Math.random() * 15)
    })),
    pipelineData: [
      { name: 'Lead', value: 45 },
      { name: 'Discovery', value: 32 },
      { name: 'Proposal', value: 18 },
      { name: 'Negotiation', value: 12 },
      { name: 'Closed', value: 8 }
    ],
    conversionData: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 30 + Math.floor(Math.random() * 15)
    })),
    revenueData: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 5000 + Math.floor(Math.random() * 3000)
    })),
    productMixData: [
      { name: 'Software', value: 42 },
      { name: 'Hardware', value: 28 },
      { name: 'Services', value: 18 },
      { name: 'Training', value: 12 }
    ]
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockData;
};

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalCalls: 0,
    avgDuration: 0,
    positiveSentiment: 0,
    negativeSentiment: 0,
    neutralSentiment: 0,
    callsPerDay: [],
    pipelineData: [],
    conversionData: [],
    revenueData: [],
    productMixData: []
  });

  const [teamMetricsData, setTeamMetricsData] = useState<TeamMetricsData>({
    members: [],
    avgCalls: 0,
    avgSuccessRate: 0,
    avgSentiment: 0
  });

  const [repMetricsData, setRepMetricsData] = useState<RepMetricsData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch analytics data
        const data = await getAnalyticsData();
        setAnalyticsData(data);
        
        // Fetch team metrics
        const teamMetrics = await getTeamMetrics();
        
        // Convert to expected format
        const teamPerformanceData: TeamPerformance[] = teamMetrics.map(tm => ({
          id: tm.teamMemberId,
          name: tm.teamMemberName,
          calls: tm.callCount,
          successRate: tm.successRate,
          avgSentiment: tm.avgSentiment,
          conversionRate: tm.successRate * 0.8 // estimate based on success rate
        }));
        
        const avgCalls = teamPerformanceData.reduce((sum, tm) => sum + tm.calls, 0) / 
          (teamPerformanceData.length || 1);
        
        const avgSuccessRate = teamPerformanceData.reduce((sum, tm) => sum + tm.successRate, 0) / 
          (teamPerformanceData.length || 1);
        
        const avgSentiment = teamPerformanceData.reduce((sum, tm) => sum + Number(tm.avgSentiment), 0) / 
          (teamPerformanceData.length || 1);
        
        setTeamMetricsData({
          members: teamPerformanceData,
          avgCalls,
          avgSuccessRate,
          avgSentiment
        });
        
        // If we have team members, get detailed metrics for the first one
        if (teamPerformanceData.length > 0) {
          const repMetrics = await getRepMetrics(teamPerformanceData[0].id);
          if (repMetrics) {
            setRepMetricsData([{
              id: repMetrics.repId,
              name: repMetrics.repName,
              calls: repMetrics.callVolume,
              successRate: repMetrics.successRate,
              sentiment: repMetrics.sentimentScore,
              keywords: repMetrics.topKeywords || []
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update the JSX to use the new data structure
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Sales Analytics"
        subtitle="Track sales performance, team activity, and pipeline metrics"
      />
      
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <OverviewCard 
          title="Total Calls" 
          value={analyticsData.totalCalls.toString()} 
          trend={8} 
          icon={<Phone className="h-6 w-6" />} 
        />
        <OverviewCard 
          title="Avg Duration" 
          value={`${Math.round(analyticsData.avgDuration / 60)} min`} 
          trend={-2} 
          trendDirection="down"
          icon={<Clock className="h-6 w-6" />} 
        />
        <OverviewCard 
          title="Positive Sentiment" 
          value={`${analyticsData.positiveSentiment} calls`} 
          trend={5}
          icon={<ThumbsUp className="h-6 w-6" />} 
        />
        <OverviewCard 
          title="Conversion Rate" 
          value={`${Math.round((analyticsData.positiveSentiment / (analyticsData.totalCalls || 1)) * 100)}%`} 
          trend={3}
          icon={<TrendingUp className="h-6 w-6" />} 
        />
      </div>

      {/* Sales Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
            <CardDescription>Current distribution of deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <BarChart
                data={analyticsData.pipelineData || []}
                xField="name"
                yField="value"
                barColor="#4f46e5"
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates</CardTitle>
            <CardDescription>Daily conversion rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <LineChart
                data={analyticsData.conversionData || []}
                xField="date"
                yField="value"
                lineColor="#10b981"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Daily revenue for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <AreaChart
                data={analyticsData.revenueData || []}
                xField="date"
                yField="value"
                areaColor="rgba(79, 70, 229, 0.2)"
                lineColor="#4f46e5"
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Mix</CardTitle>
            <CardDescription>Revenue by product category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <PieChart
                data={analyticsData.productMixData || []}
                nameField="name"
                valueField="value"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Comparative metrics for all team members</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <TeamPerformanceAnalytics data={teamMetricsData.members} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
