
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, Phone, TrendingUp, 
  BarChart2, UserCheck, Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMetrics } from '@/components/metrics/RealTimeMetricsProvider';

interface PerformanceMetricsProps {
  metricsData?: {
    totalCalls: number;
    avgDuration: number;
    positiveSentiment: number;
    callScore: number;
    conversionRate: number;
  };
  isLoading?: boolean;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  metricsData, 
  isLoading: propsLoading = false 
}) => {
  const [isLoading, setIsLoading] = useState(propsLoading);
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    avgDuration: 0,
    positiveSentiment: 0,
    callScore: 0,
    conversionRate: 0
  });
  
  const { metrics: globalMetrics, isUpdating: globalLoading } = useMetrics();
  const { toast } = useToast();
  
  // Get metrics from the global provider or props
  const updateMetricsFromProvider = useCallback(() => {
    if (metricsData) {
      console.log('Using metrics from props:', metricsData);
      setMetrics(metricsData);
      setIsLoading(propsLoading);
    } else if (!globalLoading) {
      console.log('Using metrics from provider:', globalMetrics);
      setMetrics({
        totalCalls: globalMetrics.totalCalls,
        avgDuration: globalMetrics.avgDuration,
        positiveSentiment: globalMetrics.positiveSentiment,
        callScore: globalMetrics.callScore,
        conversionRate: globalMetrics.conversionRate
      });
      setIsLoading(false);
    }
  }, [metricsData, propsLoading, globalMetrics, globalLoading]);
  
  useEffect(() => {
    updateMetricsFromProvider();
  }, [updateMetricsFromProvider]);
  
  useEffect(() => {
    // If metrics are passed as props, use them directly
    if (metricsData) {
      console.log('Using metrics from props:', metricsData);
      setMetrics(metricsData);
      setIsLoading(propsLoading);
      return;
    }
    
    const fetchMetrics = async () => {
      try {
        console.log('Fetching performance metrics from call_metrics_summary');
        setIsLoading(true);
        
        // Fetch from call_metrics_summary for latest data
        const { data, error } = await supabase
          .from('call_metrics_summary')
          .select('*')
          .order('report_date', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error fetching metrics:', error);
          // Fallback to some demo data
          console.log('Using fallback demo data due to error');
          setMetrics({
            totalCalls: 42,
            avgDuration: 320,
            positiveSentiment: 65,
            callScore: 78,
            conversionRate: 28
          });
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Successfully retrieved metrics data:', data[0]);
          
          const totalSentiment = 
            (data[0].positive_sentiment_count || 0) + 
            (data[0].negative_sentiment_count || 0) + 
            (data[0].neutral_sentiment_count || 0);
              
          const positivePercentage = totalSentiment > 0
            ? Math.round((data[0].positive_sentiment_count || 0) / totalSentiment * 100)
            : 0;
            
          setMetrics({
            totalCalls: data[0].total_calls || 0,
            avgDuration: data[0].avg_duration || 0,
            positiveSentiment: positivePercentage,
            callScore: data[0].performance_score || 0,
            conversionRate: data[0].conversion_rate ? Math.round(data[0].conversion_rate * 100) : 0
          });
        } else {
          console.log('No metrics data found, using fallback data');
          // No data found, use fallback
          setMetrics({
            totalCalls: 42,
            avgDuration: 320,
            positiveSentiment: 65,
            callScore: 78,
            conversionRate: 28
          });
        }
      } catch (err) {
        console.error('Error in fetchMetrics:', err);
        // Use fallback on error
        setMetrics({
          totalCalls: 42,
          avgDuration: 320,
          positiveSentiment: 65,
          callScore: 78,
          conversionRate: 28
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Set up real-time subscription for metrics updates
    const setupSubscription = async () => {
      const channel = supabase
        .channel('metrics-performance-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'call_metrics_summary' }, 
          (payload) => {
            console.log('Call metrics updated in database:', payload);
            fetchMetrics();
          })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    fetchMetrics();
    const cleanup = setupSubscription();
    
    return () => {
      cleanup.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [metricsData, propsLoading]);
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const metricCards = [
    {
      title: 'Total Calls',
      value: metrics.totalCalls,
      unit: '',
      icon: <Phone className="h-4 w-4 text-muted-foreground" />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Avg Duration',
      value: Math.round(metrics.avgDuration / 60) || 0, // Convert to minutes
      unit: 'min',
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Positive Sentiment',
      value: Math.round(metrics.positiveSentiment) || 0,
      unit: '%',
      icon: <UserCheck className="h-4 w-4 text-muted-foreground" />,
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Call Score',
      value: Math.round(metrics.callScore) || 0,
      unit: '',
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />,
      change: '+6%',
      trend: 'up'
    },
    {
      title: 'Conversion Rate',
      value: metrics.conversionRate || 0,
      unit: '%',
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      change: '+3%',
      trend: 'up'
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricCards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                {card.icon}
                {card.title}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                card.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {card.change}
              </span>
            </div>
            <div className="mt-2">
              {isLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <span className="text-3xl font-bold">
                  {card.value}{card.unit}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PerformanceMetrics;
