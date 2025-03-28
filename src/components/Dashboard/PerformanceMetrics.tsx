
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Phone, Clock, 
  UserCheck, BarChart2, 
  TrendingUp 
} from 'lucide-react';
import { formatDurationMinutes } from '@/utils/metricsFormatters';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  change: string;
  trend: 'up' | 'down';
  isLoading?: boolean;
}

/**
 * Individual metric card component
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  change,
  trend,
  isLoading = false
}) => (
  <Card className="border-border shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          {icon}
          {title}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {change}
        </span>
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
}

/**
 * Performance metrics grid component
 * Displays key performance indicators in a responsive grid
 */
const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  dashboardStats, 
  isLoading = false 
}) => {
  const metricCards = [
    {
      title: 'Total Calls',
      value: dashboardStats.totalCalls || 0,
      icon: <Phone className="h-4 w-4 text-muted-foreground" />,
      change: '+12%',
      trend: 'up' as const
    },
    {
      title: 'Avg Duration',
      value: formatDurationMinutes(dashboardStats.avgDuration || 0),
      unit: 'min',
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      change: '-5%',
      trend: 'down' as const
    },
    {
      title: 'Positive Sentiment',
      value: Math.round(dashboardStats.positiveSentiment || 0),
      unit: '%',
      icon: <UserCheck className="h-4 w-4 text-muted-foreground" />,
      change: '+8%',
      trend: 'up' as const
    },
    {
      title: 'Call Score',
      value: Math.round(dashboardStats.callScore || 0),
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />,
      change: '+6%',
      trend: 'up' as const
    },
    {
      title: 'Conversion Rate',
      value: Math.round(dashboardStats.conversionRate || 0),
      unit: '%',
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      change: '+3%',
      trend: 'up' as const
    },
  ];
  
  return (
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
        />
      ))}
    </div>
  );
};

export default PerformanceMetrics;
