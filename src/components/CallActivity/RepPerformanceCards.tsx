
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeDelta } from '@/components/ui/badge-delta';
import { useRepMetrics } from '@/services/RealTimeMetricsService';

const RepPerformanceCards = () => {
  const { metrics, isLoading } = useRepMetrics();
  
  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          </CardContent>
          <CardFooter>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </CardFooter>
        </Card>
      ))}
    </div>;
  }
  
  // If no metrics, show empty state
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>No Performance Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There is no performance data available for your representatives at this time.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Get the top performing reps
  const metricsArray = Array.isArray(metrics) ? metrics : [];
  
  // Get the top performing rep by sentiment
  const topSentimentRep = [...metricsArray].sort((a, b) => b.avg_sentiment - a.avg_sentiment)[0];
  
  // Get the top performing rep by conversion rate
  const topConversionRep = [...metricsArray].sort((a, b) => b.conversion_rate - a.conversion_rate)[0];
  
  // Get the most active rep by call count
  const mostActiveRep = [...metricsArray].sort((a, b) => b.call_count - a.call_count)[0];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Top Sentiment Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Top Sentiment Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topSentimentRep.rep_name}
          </div>
          <p className="text-xs text-muted-foreground">
            Average sentiment score: {(topSentimentRep.avg_sentiment * 100).toFixed(0)}%
          </p>
        </CardContent>
        <CardFooter className="py-2">
          <BadgeDelta deltaType="increase">
            Top performer
          </BadgeDelta>
        </CardFooter>
      </Card>
      
      {/* Top Conversion Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Top Conversion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topConversionRep.rep_name}
          </div>
          <p className="text-xs text-muted-foreground">
            Conversion rate: {(topConversionRep.conversion_rate * 100).toFixed(0)}%
          </p>
        </CardContent>
        <CardFooter className="py-2">
          <BadgeDelta deltaType="increase">
            Top performer
          </BadgeDelta>
        </CardFooter>
      </Card>
      
      {/* Most Active Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Most Active Representative
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mostActiveRep.rep_name}
          </div>
          <p className="text-xs text-muted-foreground">
            Total calls: {mostActiveRep.call_count}
          </p>
        </CardContent>
        <CardFooter className="py-2">
          <BadgeDelta deltaType="increase">
            Top performer
          </BadgeDelta>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RepPerformanceCards;
