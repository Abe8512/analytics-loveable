
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { fixCallSentiments } from '@/utils/fixCallSentiments';

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
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      setIsUsingDemoData(false);
      
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
          setError(`Failed to fetch metrics: ${error.message}`);
          generateDemoMetrics();
          return;
        }
        
        // Handle empty data gracefully
        if (!data || data.length === 0) {
          console.log('No metrics data available, using demo data');
          generateDemoMetrics();
          return;
        }
        
        console.log(`Successfully retrieved ${data.length} metrics records`, data);
        
        // Check if all metrics have valid data
        const allMetricsNeutral = data.every(
          (m) => m.avg_sentiment === 0.5 && 
                m.positive_sentiment_count === 0 && 
                m.negative_sentiment_count === 0
        );
        
        if (allMetricsNeutral) {
          console.warn('All metrics have neutral sentiment, generating more realistic data');
          generateDemoMetrics();
          return;
        }
        
        setMetrics(data || []);
        setIsUsingDemoData(false);
      } catch (err) {
        console.error('Error in fetchMetrics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching metrics');
        generateDemoMetrics();
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [dateRange]);
  
  // Generate demo metrics with more realistic data distribution
  const generateDemoMetrics = () => {
    console.log('Generating demo metrics data');
    setIsUsingDemoData(true);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const demoMetrics = [
      {
        report_date: today.toISOString().split('T')[0],
        total_calls: 24,
        avg_duration: 360, // 6 minutes in seconds
        positive_sentiment_count: 18,
        negative_sentiment_count: 3,
        neutral_sentiment_count: 3,
        avg_sentiment: 0.75,
        agent_talk_ratio: 45,
        customer_talk_ratio: 55,
        performance_score: 82
      },
      {
        report_date: yesterday.toISOString().split('T')[0],
        total_calls: 21,
        avg_duration: 330, // 5.5 minutes in seconds
        positive_sentiment_count: 14,
        negative_sentiment_count: 4,
        neutral_sentiment_count: 3,
        avg_sentiment: 0.68,
        agent_talk_ratio: 48,
        customer_talk_ratio: 52,
        performance_score: 78
      }
    ];
    
    setMetrics(demoMetrics);
  };
  
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
                    (change) => change < 0), // lower duration is positive
    formatMetricRow('Positive Calls', (data) => data.positive_sentiment_count || 0),
    formatMetricRow('Average Sentiment', (data) => Math.round((data.avg_sentiment || 0) * 100)),
    formatMetricRow('Agent Talk Ratio', (data) => Math.round(data.agent_talk_ratio || 0), 
                    (change) => change < 0), // lower talk ratio is positive
    formatMetricRow('Performance Score', (data) => data.performance_score || 0)
  ];
  
  // Function to fix sentiment values
  const handleFixSentiments = async () => {
    setIsUpdating(true);
    try {
      const result = await fixCallSentiments();
      
      toast({
        title: "Sentiment Update Complete",
        description: `Updated ${result.updated} of ${result.total} calls. Failed: ${result.failed}`,
        variant: result.failed > 0 ? "destructive" : "default"
      });
      
      // Refresh metrics after update
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error fixing sentiments:', err);
      toast({
        title: "Error",
        description: "Failed to update call sentiments. See console for details.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
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
          
          {isUsingDemoData && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFixSentiments} 
              disabled={isUpdating}
              className="flex items-center gap-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Fix Sentiments
                </>
              )}
            </Button>
          )}
        </div>
        
        {isUsingDemoData && (
          <Alert variant="warning" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Using demo data. Some calls have neutral sentiment - click "Fix Sentiments" to analyze and update them.
            </AlertDescription>
          </Alert>
        )}
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
