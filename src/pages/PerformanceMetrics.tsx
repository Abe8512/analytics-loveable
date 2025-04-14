
import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { useSharedFilters } from '@/contexts/SharedFilterContext';
import KeyMetricsTable from '@/components/Performance/KeyMetricsTable';
import TrendingInsightsCard from '@/components/Performance/TrendingInsightsCard';
import { PageHeader } from '@/components/ui/page-header';
import { LineChart, RefreshCcw } from 'lucide-react';
import { useMetrics } from '@/contexts/MetricsContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
      
      // Provide default data
      setSalesInsights([
        { 
          title: 'Call Volume Trending Up', 
          description: 'Call volume increased by 15% compared to previous period',
          category: 'positive',
          date: new Date().toISOString()
        },
        {
          title: 'Conversion Rate Improvement',
          description: 'Team conversion rate has improved by 5% this month',
          category: 'positive',
          date: new Date().toISOString()
        },
        {
          title: 'Call Duration Increasing',
          description: 'Average call duration is up 2 minutes from last month',
          category: 'neutral',
          date: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // React to filter changes
  React.useEffect(() => {
    fetchSalesInsights();
  }, [filters]);
  
  // Prepare insights for coaching and opportunities sections
  const coachingInsights = [
    {
      title: 'More Discovery Questions Needed',
      description: 'Top performers ask 40% more discovery questions',
      category: 'action',
      date: new Date().toISOString()
    },
    {
      title: 'Objection Handling Opportunity',
      description: 'Price objections are increasing by 20% this quarter',
      category: 'warning',
      date: new Date().toISOString()
    }
  ];
  
  const opportunityInsights = [
    {
      title: 'Feature Requests Trending',
      description: 'Customers asking about advanced reporting features',
      category: 'opportunity',
      date: new Date().toISOString()
    },
    {
      title: 'Integration Questions Rising',
      description: '35% increase in API integration questions',
      category: 'opportunity',
      date: new Date().toISOString()
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
    </DashboardLayout>
  );
};

export default PerformanceMetrics;
