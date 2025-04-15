
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KeyMetricsTableProps {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

const KeyMetricsTable: React.FC<KeyMetricsTableProps> = ({ dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      setIsEmpty(false);
      
      try {
        console.log('Fetching metrics with date range:', dateRange);
        let query = supabase
          .from('call_metrics_summary')
          .select('*')
          .order('report_date', { ascending: false });
        
        if (dateRange?.from) {
          query = query.gte('report_date', dateRange.from.toISOString().split('T')[0]);
        }
        
        if (dateRange?.to) {
          query = query.lte('report_date', dateRange.to.toISOString().split('T')[0]);
        }
        
        if (!dateRange?.from && !dateRange?.to) {
          const last7Days = new Date();
          last7Days.setDate(last7Days.getDate() - 7);
          query = query.gte('report_date', last7Days.toISOString().split('T')[0]);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching metrics:', error);
          setError(`Failed to fetch metrics: ${error.message}`);
          setIsEmpty(true);
          return;
        }
        
        if (!data || data.length === 0) {
          console.log('No metrics data available');
          setIsEmpty(true);
          return;
        }
        
        console.log(`Successfully retrieved ${data.length} metrics records`, data);
        
        // Check if all metrics are neutral - which may indicate no processing has happened
        const allMetricsNeutral = data.every(
          (m) => m.avg_sentiment === 0.5 && 
                m.positive_sentiment_count === 0 && 
                m.negative_sentiment_count === 0
        );
        
        if (allMetricsNeutral) {
          console.warn('All metrics have neutral sentiment, may need processing');
        }
        
        setMetrics(data || []);
        setIsEmpty(false);
      } catch (err) {
        console.error('Error in fetchMetrics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching metrics');
        setIsEmpty(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [dateRange]);
  
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  const formatMetricRow = (name: string, getValue: (data: any) => number, isPositive: (change: number) => boolean = (change) => change > 0) => {
    if (metrics.length === 0) return { name, current: 0, previous: 0, change: 0 };
    
    const current = getValue(metrics[0]);
    const previous = metrics.length > 1 ? getValue(metrics[1]) : 0;
    const change = calculateChange(current, previous);
    
    return { 
      name, 
      current, 
      previous, 
      change,
      isPositiveChange: isPositive(change)
    };
  };
  
  const metricRows = [
    formatMetricRow('Total Calls', (data) => data.total_calls || 0),
    formatMetricRow('Avg Duration (min)', (data) => Math.round((data.avg_duration || 0) / 60), 
                    (change) => change < 0),
    formatMetricRow('Positive Calls', (data) => data.positive_sentiment_count || 0),
    formatMetricRow('Average Sentiment', (data) => Math.round((data.avg_sentiment || 0) * 100)),
    formatMetricRow('Agent Talk Ratio', (data) => Math.round(data.agent_talk_ratio || 0), 
                    (change) => change < 0),
    formatMetricRow('Performance Score', (data) => data.performance_score || 0)
  ];
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Metrics</CardTitle>
          <CardDescription>
            Error loading metrics data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="text-center py-8">
            <p>We couldn't load your metrics data at this time.</p>
            <p className="text-sm text-muted-foreground mt-2">Please try again later or contact support if the problem persists.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isEmpty && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Metrics</CardTitle>
          <CardDescription>
            No metrics data available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>No metrics data is available for the selected period.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try uploading and processing some call recordings to generate metrics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Key Performance Metrics</CardTitle>
            <CardDescription>
              Comparing current period to previous period
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Metric</th>
                  <th className="text-right py-3 px-4 font-medium">Current</th>
                  <th className="text-right py-3 px-4 font-medium">Previous</th>
                  <th className="text-right py-3 px-4 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {metricRows.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{row.name}</td>
                    <td className="text-right py-3 px-4 font-medium">{row.current}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{row.previous}</td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {row.change > 0 ? (
                          <>
                            <ArrowUpRight className={`h-4 w-4 ${row.isPositiveChange ? 'text-green-500' : 'text-red-500'}`} />
                            <span className={row.isPositiveChange ? 'text-green-500' : 'text-red-500'}>{row.change}%</span>
                          </>
                        ) : row.change < 0 ? (
                          <>
                            <ArrowDownRight className={`h-4 w-4 ${!row.isPositiveChange ? 'text-green-500' : 'text-red-500'}`} />
                            <span className={!row.isPositiveChange ? 'text-green-500' : 'text-red-500'}>{Math.abs(row.change)}%</span>
                          </>
                        ) : (
                          <>
                            <Minus className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-500">0%</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeyMetricsTable;
