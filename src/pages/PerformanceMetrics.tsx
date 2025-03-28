
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { useSharedFilters } from '@/contexts/SharedFilterContext';
import KeyMetricsTable from '@/components/Performance/KeyMetricsTable';
import TrendingInsightsCard from '@/components/Performance/TrendingInsightsCard';
import { PageHeader } from '@/components/ui/page-header';
import { LineChart, RefreshCcw } from 'lucide-react';
import { useMetrics } from '@/contexts/MetricsContext';
import { 
  generateDemoSalesInsights, 
  generateDemoCoachingInsights, 
  generateDemoOpportunityInsights 
} from '@/services/DemoDataService';
import { MetricsFilters } from '@/types/metrics';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

/**
 * Performance Metrics Page
 * Displays comprehensive metrics about sales performance
 */
const PerformanceMetrics = () => {
  const { filters } = useSharedFilters();
  const { metricsData, refresh, isLoading: metricsLoading, error } = useMetrics();
  
  const [salesInsights, setSalesInsights] = useState<any[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesInsights = async () => {
      try {
        setIsLoadingInsights(true);
        setInsightsError(null);

        // Try to fetch from database first
        // The "sales_insights" table doesn't exist, so we need to generate demo data
        setSalesInsights(generateDemoSalesInsights());
      } catch (err) {
        console.error("Failed to fetch sales insights:", err);
        setInsightsError(err instanceof Error ? err.message : 'Error fetching insights');
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
  
  const handleRefresh = async () => {
    try {
      await refresh(true); // Force refresh metrics data
      toast({
        title: "Data Refreshed",
        description: "Performance metrics have been updated with the latest data."
      });
    } catch (err) {
      console.error("Failed to refresh metrics:", err);
      toast({
        title: "Refresh Failed",
        description: "Could not update performance metrics.",
        variant: "destructive"
      });
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
            disabled={metricsLoading}
            className="flex items-center gap-1"
          >
            <RefreshCcw className={`h-4 w-4 ${metricsLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <KeyMetricsTable dateRange={filters.dateRange} />
          
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
