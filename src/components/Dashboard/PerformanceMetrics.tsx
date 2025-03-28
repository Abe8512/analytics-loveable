
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Phone, Clock, 
  UserCheck, BarChart2, 
  TrendingUp 
} from 'lucide-react';
import { useMetrics } from '@/components/metrics/RealTimeMetricsProvider';
import { formatDurationMinutes } from '@/utils/metricsFormatters';
import { MetricsData } from '@/types/metrics';

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

interface PerformanceMetricsProps {
  metricsData?: Partial<MetricsData>;
  isLoading?: boolean;
}

/**
 * Performance metrics grid component
 * Displays key performance indicators in a responsive grid
 */
const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  metricsData, 
  isLoading: propsLoading = false 
}) => {
  const [localMetrics, setLocalMetrics] = useState<Partial<MetricsData>>({
    totalCalls: 0,
    avgDuration: 0,
    positiveSentiment: 0,
    callScore: 0,
    conversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(propsLoading);
  
  const { metrics: globalMetrics, isUpdating: globalLoading } = useMetrics();
  
  // Get metrics from the global provider or props
  const updateMetricsFromProvider = useCallback(() => {
    if (metricsData) {
      console.log('Using metrics from props:', metricsData);
      setLocalMetrics(metricsData);
      setIsLoading(propsLoading);
    } else if (!globalLoading) {
      console.log('Using metrics from provider:', globalMetrics);
      setLocalMetrics({
        totalCalls: globalMetrics.totalCalls,
        avgDuration: globalMetrics.avgDuration,
        positiveSentiment: globalMetrics.positiveSentiment,
        callScore: globalMetrics.callScore,
        conversionRate: globalMetrics.conversionRate
      });
      setIsLoading(globalMetrics.isLoading);
    }
  }, [metricsData, propsLoading, globalMetrics, globalLoading]);
  
  useEffect(() => {
    updateMetricsFromProvider();
  }, [updateMetricsFromProvider]);
  
  const metricCards = [
    {
      title: 'Total Calls',
      value: localMetrics.totalCalls || 0,
      icon: <Phone className="h-4 w-4 text-muted-foreground" />,
      change: '+12%',
      trend: 'up' as const
    },
    {
      title: 'Avg Duration',
      value: formatDurationMinutes(localMetrics.avgDuration || 0),
      unit: 'min',
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      change: '-5%',
      trend: 'down' as const
    },
    {
      title: 'Positive Sentiment',
      value: Math.round(localMetrics.positiveSentiment || 0),
      unit: '%',
      icon: <UserCheck className="h-4 w-4 text-muted-foreground" />,
      change: '+8%',
      trend: 'up' as const
    },
    {
      title: 'Call Score',
      value: Math.round(localMetrics.callScore || 0),
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />,
      change: '+6%',
      trend: 'up' as const
    },
    {
      title: 'Conversion Rate',
      value: localMetrics.conversionRate || 0,
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
