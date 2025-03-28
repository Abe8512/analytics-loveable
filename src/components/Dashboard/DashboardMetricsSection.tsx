
import React from 'react';
import { LineChart, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PerformanceMetrics from './PerformanceMetrics';
import { useMetrics } from '@/contexts/MetricsContext';
import { extractDashboardKPIs } from '@/utils/metricsProcessor';

const DashboardMetricsSection: React.FC = () => {
  const { metricsData, isLoading, refresh } = useMetrics();
  
  // Extract the necessary metrics for the dashboard
  const dashboardStats = extractDashboardKPIs(metricsData);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col space-y-2"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Performance Overview</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/performance-metrics">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              View Detailed Metrics
            </Button>
          </Link>
        </div>
      </div>
      
      <PerformanceMetrics 
        dashboardStats={dashboardStats}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default DashboardMetricsSection;
