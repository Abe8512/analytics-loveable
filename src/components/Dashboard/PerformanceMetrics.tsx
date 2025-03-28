
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Phone, Clock, 
  UserCheck, BarChart2, 
  TrendingUp, AlertCircle
} from 'lucide-react';
import { formatDurationMinutes } from '@/utils/metricsFormatters';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
  tooltip?: string;
}

/**
 * Individual metric card component with enhanced loading states
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  change,
  trend = 'neutral',
  isLoading = false,
  tooltip
}) => (
  <Card className="border-border shadow-sm transition-all duration-300 hover:shadow-md">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1" title={tooltip}>
          {icon}
          {title}
        </span>
        {!isLoading && change && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
            trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
            'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div className="mt-2">
        {isLoading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <span className="text-3xl font-bold">
            {value}{unit}
          </span>
        )}
      </div>
    </CardContent>
  </Card>
);

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
      change: '+12%',
      trend: 'up' as const,
      tooltip: 'Number of calls processed in this period'
    },
    {
      title: 'Avg Duration',
      value: formatDurationMinutes(dashboardStats.avgDuration || 0),
      unit: 'min',
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      change: '-5%',
      trend: 'down' as const,
      tooltip: 'Average call duration in minutes'
    },
    {
      title: 'Positive Sentiment',
      value: Math.round(dashboardStats.positiveSentiment || 0),
      unit: '%',
      icon: <UserCheck className="h-4 w-4 text-muted-foreground" />,
      change: '+8%',
      trend: 'up' as const,
      tooltip: 'Percentage of calls with positive sentiment'
    },
    {
      title: 'Call Score',
      value: Math.round(dashboardStats.callScore || 0),
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />,
      change: '+6%',
      trend: 'up' as const,
      tooltip: 'Overall call performance score'
    },
    {
      title: 'Conversion Rate',
      value: Math.round(dashboardStats.conversionRate || 0),
      unit: '%',
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      change: '+3%',
      trend: 'up' as const,
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
            change={card.change}
            trend={card.trend}
            isLoading={isLoading}
            tooltip={card.tooltip}
          />
        ))}
      </div>
    </div>
  );
};

export default PerformanceMetrics;
