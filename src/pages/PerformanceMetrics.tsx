
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSharedFilters } from '@/contexts/SharedFilterContext';
import KeyMetricsTable from '@/components/Performance/KeyMetricsTable';
import TrendingInsightsCard from '@/components/Performance/TrendingInsightsCard';
import { PageHeader } from '@/components/ui/page-header';
import { LineChart, UsersRound, Calendar, Zap, BrainCircuit } from 'lucide-react';
import { useTeamMetricsData } from '@/services/SharedDataService';

const PerformanceMetrics = () => {
  const { filters } = useSharedFilters();
  const { metrics, isLoading, error: metricsError } = useTeamMetricsData(filters);
  const [salesInsights, setSalesInsights] = useState<any[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesInsights = async () => {
      try {
        setIsLoadingInsights(true);
        setError(null);

        // Try to fetch from database first
        // The "sales_insights" table doesn't exist, so we need to generate demo data
        generateDemoInsights();
      } catch (err) {
        console.error("Failed to fetch sales insights:", err);
        setError(err instanceof Error ? err.message : 'Error fetching insights');
        // Fall back to demo data
        generateDemoInsights();
      } finally {
        setIsLoadingInsights(false);
      }
    };

    fetchSalesInsights();
  }, [filters]);

  const generateDemoInsights = () => {
    // Generate demo insights data when no database data is available
    const demoInsights = [
      {
        id: '1',
        title: 'Conversion Rate',
        value: '42%',
        change: 8,
        isPositive: true,
        tooltip: 'Percentage of calls resulting in a successful sale'
      },
      {
        id: '2',
        title: 'Avg. Call Duration',
        value: '12.5 min',
        change: -3,
        isPositive: true,
        tooltip: 'Average length of sales calls - shorter calls can indicate improved efficiency'
      },
      {
        id: '3',
        title: 'Daily Calls',
        value: '48',
        change: 15,
        isPositive: true,
        tooltip: 'Number of calls made per day'
      },
      {
        id: '4',
        title: 'Sentiment Score',
        value: '76%',
        change: 5,
        isPositive: true,
        tooltip: 'Average sentiment score across all calls'
      },
      {
        id: '5',
        title: 'Response Time',
        value: '4.2 hrs',
        change: -12,
        isPositive: true,
        tooltip: 'Average time to respond to customer inquiries'
      },
      {
        id: '6',
        title: 'Talk Ratio',
        value: '38%',
        change: -5,
        isPositive: true,
        tooltip: 'Percentage of time sales reps spend talking vs. listening'
      }
    ];

    setSalesInsights(demoInsights);
  };

  // Prepare insights for coaching and opportunities sections
  const coachingInsights = [
    {
      id: 'c1',
      title: 'Objection Handling',
      value: '65%',
      change: -8,
      isPositive: false,
      tooltip: 'Success rate in overcoming customer objections'
    },
    {
      id: 'c2',
      title: 'Feature Knowledge',
      value: '82%',
      change: 5,
      isPositive: true,
      tooltip: 'Accuracy of product feature explanations'
    },
    {
      id: 'c3',
      title: 'Call Confidence',
      value: '71%',
      change: 12,
      isPositive: true,
      tooltip: 'Confidence level detected in voice analysis'
    },
    {
      id: 'c4',
      title: 'Follow-up Rate',
      value: '58%',
      change: -3,
      isPositive: false,
      tooltip: 'Percentage of calls with proper follow-up'
    }
  ];

  const opportunityInsights = [
    {
      id: 'o1',
      title: 'Pricing Discussions',
      value: '62%',
      change: 15,
      isPositive: true,
      tooltip: 'Percentage of calls with successful pricing discussions'
    },
    {
      id: 'o2',
      title: 'Competitor Mentions',
      value: '24',
      change: -5,
      isPositive: true,
      tooltip: 'Number of competitor mentions in calls'
    },
    {
      id: 'o3',
      title: 'Upsell Attempts',
      value: '43%',
      change: 7,
      isPositive: true,
      tooltip: 'Percentage of calls with upsell attempts'
    },
    {
      id: 'o4',
      title: 'Demo Requests',
      value: '38',
      change: 22,
      isPositive: true,
      tooltip: 'Number of requests for product demonstrations'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <PageHeader 
          title="Performance Analytics"
          subtitle="Comprehensive sales performance metrics and insights"
          icon={<LineChart className="h-6 w-6" />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <KeyMetricsTable dateRange={filters.dateRange} />
          
          <TrendingInsightsCard
            title="Sales Performance Insights"
            description="Key metrics trends over the selected period"
            insights={salesInsights}
            isLoading={isLoadingInsights}
            error={error}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <TrendingInsightsCard
            title="Coaching Opportunities"
            description="Areas for improvement and coaching"
            insights={coachingInsights}
            className="h-full"
          />
          
          <TrendingInsightsCard
            title="Sales Opportunities"
            description="Potential areas to focus on"
            insights={opportunityInsights}
            className="h-full"
          />
        </div>

        {/* Additional statistics and cards can be added here */}
      </div>
    </DashboardLayout>
  );
};

export default PerformanceMetrics;
