
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSharedFilters } from '@/contexts/SharedFilterContext';
import KeyMetricsTable from '@/components/Performance/KeyMetricsTable';
import TrendingInsightsCard from '@/components/Performance/TrendingInsightsCard';
import { PageHeader } from '@/components/ui/page-header';
import { LineChart } from 'lucide-react';
import { useTeamMetricsData } from '@/services/MetricsService';
import { 
  generateDemoSalesInsights, 
  generateDemoCoachingInsights, 
  generateDemoOpportunityInsights 
} from '@/services/DemoDataService';
import { MetricsFilters } from '@/types/metrics';

/**
 * Performance Metrics Page
 * Displays comprehensive metrics about sales performance
 */
const PerformanceMetrics = () => {
  const { filters } = useSharedFilters();
  const metricsFilters: MetricsFilters = {
    dateRange: filters.dateRange,
    repIds: filters.repIds
  };
  
  const { metrics, isLoading: metricsLoading } = useTeamMetricsData(metricsFilters);
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
        setSalesInsights(generateDemoSalesInsights());
      } catch (err) {
        console.error("Failed to fetch sales insights:", err);
        setError(err instanceof Error ? err.message : 'Error fetching insights');
        // Fall back to demo data
        setSalesInsights(generateDemoSalesInsights());
      } finally {
        setIsLoadingInsights(false);
      }
    };

    fetchSalesInsights();
  }, [filters]);

  // Prepare insights for coaching and opportunities sections
  const coachingInsights = generateDemoCoachingInsights();
  const opportunityInsights = generateDemoOpportunityInsights();

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
      </div>
    </DashboardLayout>
  );
};

export default PerformanceMetrics;
