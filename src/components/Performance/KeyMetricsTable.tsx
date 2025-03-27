
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KeyMetricsTableProps {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

const KeyMetricsTable: React.FC<KeyMetricsTableProps> = ({ dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
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
        
        // Limit to last 7 days if no date range specified
        if (!dateRange?.from && !dateRange?.to) {
          const last7Days = new Date();
          last7Days.setDate(last7Days.getDate() - 7);
          query = query.gte('report_date', last7Days.toISOString().split('T')[0]);
        }
        
        // Use standard select instead of single to avoid 406 errors
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching metrics:', error);
          setMetrics([]);
          return;
        }
        
        // Handle empty data gracefully
        if (!data || data.length === 0) {
          console.log('No metrics data available');
          setMetrics([]);
          return;
        }
        
        setMetrics(data || []);
      } catch (err) {
        console.error('Error in fetchMetrics:', err);
        setMetrics([]);
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
  
  const formatMetricRow = (name: string, getValue: (data: any) => number) => {
    if (metrics.length === 0) return { name, current: 0, previous: 0, change: 0 };
    
    const current = getValue(metrics[0]);
    const previous = metrics.length > 1 ? getValue(metrics[1]) : 0;
    const change = calculateChange(current, previous);
    
    return { name, current, previous, change };
  };
  
  const metricRows = [
    formatMetricRow('Total Calls', (data) => data.total_calls || 0),
    formatMetricRow('Avg Duration (min)', (data) => Math.round((data.avg_duration || 0) / 60)),
    formatMetricRow('Positive Calls', (data) => data.positive_sentiment_count || 0),
    formatMetricRow('Average Sentiment', (data) => Math.round((data.avg_sentiment || 0) * 100)),
    formatMetricRow('Agent Talk Ratio', (data) => Math.round(data.agent_talk_ratio || 0)),
    formatMetricRow('Performance Score', (data) => data.performance_score || 0)
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Performance Metrics</CardTitle>
        <CardDescription>
          Comparing current period to previous period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-[300px]" />
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
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">{row.change}%</span>
                          </>
                        ) : row.change < 0 ? (
                          <>
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                            <span className="text-red-500">{Math.abs(row.change)}%</span>
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
