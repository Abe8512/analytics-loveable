
import React from 'react';
import { LineChart, RefreshCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PerformanceMetrics from './PerformanceMetrics';
import { useMetrics } from '@/contexts/MetricsContext';
import { extractDashboardKPIs } from '@/utils/metricsProcessor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DashboardMetricsSection: React.FC = () => {
  const { metricsData, isLoading, refresh, error, isUsingDemoData } = useMetrics();
  
  // Extract the necessary metrics for the dashboard
  const dashboardStats = extractDashboardKPIs(metricsData);
  
  // Format the last update time
  const getLastUpdateText = () => {
    if (!metricsData.lastUpdated) return 'Never updated';
    
    // Format relative time (e.g., "2 minutes ago")
    const now = new Date();
    const diff = Math.floor((now.getTime() - metricsData.lastUpdated.getTime()) / 1000); // diff in seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) !== 1 ? 's' : ''} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) !== 1 ? 's' : ''} ago`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col space-y-2"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Performance Overview</h2>
          {metricsData.lastUpdated && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground">
                    {getLastUpdateText()}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {metricsData.lastUpdated.toLocaleString()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-1 w-full sm:w-auto"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/performance-metrics" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex items-center gap-2 w-full">
              <LineChart className="h-4 w-4" />
              View Detailed Metrics
            </Button>
          </Link>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <PerformanceMetrics 
        dashboardStats={dashboardStats}
        isLoading={isLoading}
        error={error}
        isUsingDemoData={isUsingDemoData}
      />
    </motion.div>
  );
};

export default DashboardMetricsSection;
