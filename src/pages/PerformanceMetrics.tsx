
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { useSharedFilters } from '@/contexts/SharedFilterContext';
import KeyMetricsTable from '@/components/Performance/KeyMetricsTable';
import TrendingInsightsCard from '@/components/Performance/TrendingInsightsCard';
import TeamPerformanceMetricsCard from '@/components/Performance/TeamPerformanceMetricsCard';
import { PageHeader } from '@/components/ui/page-header';
import { LineChart, RefreshCcw } from 'lucide-react';
import { useMetrics } from '@/contexts/MetricsContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamProvider } from '@/contexts/TeamContext';

/**
 * Performance Metrics Page
 * Displays comprehensive metrics about sales performance
 */
const PerformanceMetrics = () => {
  const { filters } = useSharedFilters();
  const { 
    refresh, 
    isLoading: metricsLoading, 
    error, 
    isRefreshing 
  } = useMetrics();
  
  const [salesInsights, setSalesInsights] = useState<any[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Fetch sales insights from the API
  const fetchSalesInsights = async () => {
    setIsLoadingInsights(true);
    setInsightsError(null);
    
    try {
      // API call would go here
      const response = await fetch('/api/sales-insights');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales insights');
      }
      
      const data = await response.json();
      setSalesInsights(data);
    } catch (err) {
      console.error("Failed to fetch sales insights:", err);
      setInsightsError(err instanceof Error ? err.message : 'Error fetching insights');
      
      // Provide default data that matches the InsightItem interface
      setSalesInsights([
        { 
          id: "insight-1",
          title: 'Call Volume Trending Up', 
          value: "15%",
          change: 15,
          isPositive: true,
          tooltip: 'Compared to previous period'
        },
        {
          id: "insight-2",
          title: 'Conversion Rate Improvement',
          value: "5%",
          change: 5,
          isPositive: true,
          tooltip: 'Improvement this month'
        },
        {
          id: "insight-3",
          title: 'Call Duration Increasing',
          value: "+2 min",
          change: 2,
          isPositive: false,
          tooltip: 'Change from last month'
        }
      ]);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // React to filter changes
  useEffect(() => {
    fetchSalesInsights();
  }, [filters]);
  
  // Prepare insights for coaching and opportunities sections
  // Updated to match InsightItem interface
  const coachingInsights = [
    {
      id: "coaching-1",
      title: 'More Discovery Questions Needed',
      value: "40%",
      change: 40,
      isPositive: false,
      tooltip: 'Top performers ask more discovery questions'
    },
    {
      id: "coaching-2",
      title: 'Objection Handling Opportunity',
      value: "20%",
      change: 20,
      isPositive: false,
      tooltip: 'Price objections are increasing this quarter'
    }
  ];
  
  const opportunityInsights = [
    {
      id: "opportunity-1",
      title: 'Feature Requests Trending',
      value: "35%",
      change: 35,
      isPositive: true,
      tooltip: 'Customers asking about advanced reporting features'
    },
    {
      id: "opportunity-2",
      title: 'Integration Questions Rising',
      value: "35%",
      change: 35,
      isPositive: true,
      tooltip: 'Increase in API integration questions'
    }
  ];
  
  const handleRefresh = async () => {
    try {
      toast.loading("Refreshing metrics");
      
      // Refresh both metrics and insights
      await Promise.all([
        refresh(true),
        fetchSalesInsights()
      ]);
      
      toast.success("Data refreshed successfully");
    } catch (err) {
      console.error("Failed to refresh data:", err);
      toast.error("Could not update performance metrics");
    }
  };

  return (
    <DashboardLayout>
      <TeamProvider>
        <div className="space-y-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <PageHeader 
              title="Performance Analytics"
              subtitle="Comprehensive sales performance metrics and insights"
              icon={<LineChart className="h-6 w-6" />}
            />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={metricsLoading || isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCcw className={`h-4 w-4 ${metricsLoading || isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {metricsLoading ? (
              <Card className="p-6">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </Card>
            ) : (
              <KeyMetricsTable dateRange={filters.dateRange} />
            )}
            
            <TrendingInsightsCard
              title="Sales Performance Insights"
              description="Key metrics trends over the selected period"
              insights={salesInsights}
              isLoading={isLoadingInsights}
              error={insightsError}
            />
          </div>

          {/* Team Performance Metrics Card */}
          <TeamPerformanceMetricsCard />

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
        </div>
      </TeamProvider>
    </DashboardLayout>
  );
};

export default PerformanceMetrics;
