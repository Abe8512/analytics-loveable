
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, Clock, 
  UserCheck, BarChart2, 
  TrendingUp, AlertCircle
} from 'lucide-react';
import { formatDurationMinutes } from '@/utils/metricsFormatters';
import MetricCard from '@/components/ui/metric-card';

interface DashboardStats {
  totalCalls: number;
  avgDuration: number;
  positiveSentiment: number;
  callScore: number;
  conversionRate: number;
}

interface PerformanceMetricsProps {
  dashboardStats: DashboardStats;
  isLoading?: boolean;
  error?: string | null;
  isUsingDemoData?: boolean;
}

/**
 * Performance metrics grid component with enhanced UI feedback
 */
const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  dashboardStats, 
  isLoading = false,
  error = null,
  isUsingDemoData = false
}) => {
  // Define the metrics cards configuration
  const metricCards = [
    {
      title: 'Total Calls',
      value: dashboardStats.totalCalls || 0,
      icon: <Phone className="h-4 w-4 text-muted-foreground" />,
      tooltip: 'Number of calls processed in this period'
    },
    {
      title: 'Avg Duration',
      value: formatDurationMinutes(dashboardStats.avgDuration || 0),
      unit: 'min',
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      tooltip: 'Average call duration in minutes'
    },
    {
      title: 'Positive Sentiment',
      value: Math.round(dashboardStats.positiveSentiment || 0),
      unit: '%',
      icon: <UserCheck className="h-4 w-4 text-muted-foreground" />,
      tooltip: 'Percentage of calls with positive sentiment'
    },
    {
      title: 'Call Score',
      value: Math.round(dashboardStats.callScore || 0),
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />,
      tooltip: 'Overall call performance score'
    },
    {
      title: 'Conversion Rate',
      value: Math.round(dashboardStats.conversionRate || 0),
      unit: '%',
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      tooltip: 'Percentage of calls resulting in a conversion'
    },
  ];
  
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metricCards.map((card, index) => (
            <MetricCard
              key={index}
              title={card.title}
              value="--"
              icon={card.icon}
              isLoading={false}
              tooltip={card.tooltip}
            />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {isUsingDemoData && (
        <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Using demo metrics data. Connect to a live data source for real metrics.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricCards.map((card, index) => (
          <MetricCard
            key={index}
            title={card.title}
            value={card.value}
            unit={card.unit}
            icon={card.icon}
            isLoading={isLoading}
            tooltip={card.tooltip}
          />
        ))}
      </div>
    </div>
  );
};

export default PerformanceMetrics;
