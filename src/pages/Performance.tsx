import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useSharedFilters } from '@/contexts/SharedFilterContext';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, LineChart, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamPerformanceMetrics from '@/components/Analytics/TeamPerformanceMetrics';
import { AdvancedMetricsChart } from '@/components/Analytics/AdvancedMetricsChart';
import { useToast } from '@/hooks/use-toast';

interface PerformanceProps {}

const Performance: React.FC<PerformanceProps> = () => {
  const { filters } = useSharedFilters();
  const { data: analyticsData, isLoading, error } = useAnalyticsData(filters);
  const [isDemo, setIsDemo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (analyticsData && analyticsData.totalCalls === '324') {
      setIsDemo(true);
    } else {
      setIsDemo(false);
    }
  }, [analyticsData]);

  const demoAlert = useCallback(() => {
    toast({
      title: "Demo Mode Active",
      description: "Analytics data is currently running in demo mode. Connect your data source for real-time insights.",
    });
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <PageHeader 
          title="Performance Analytics"
          subtitle="Comprehensive sales performance metrics and insights"
          icon={<LineChart className="h-6 w-6" />}
        />
        
        <Tabs defaultValue="overview" className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  Key Performance Indicators
                </CardTitle>
                <CardDescription>
                  Real-time overview of your sales performance
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                        <h4 className="text-2xl font-bold mt-1">{isLoading ? 'Loading...' : analyticsData?.totalCalls}</h4>
                      </div>
                      <div className="p-2 rounded-full bg-blue-500/10">
                        <LineChart className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
                        <h4 className="text-2xl font-bold mt-1">{isLoading ? 'Loading...' : analyticsData?.avgDuration}</h4>
                      </div>
                      <div className="p-2 rounded-full bg-green-500/10">
                        <Clock className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <h4 className="text-2xl font-bold mt-1">{isLoading ? 'Loading...' : analyticsData?.conversionRate}</h4>
                      </div>
                      <div className="p-2 rounded-full bg-purple-500/10">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Sentiment Score</p>
                        <h4 className="text-2xl font-bold mt-1">{isLoading ? 'Loading...' : analyticsData?.sentimentScore}</h4>
                      </div>
                      <div className="p-2 rounded-full bg-orange-500/10">
                        <BarChart2 className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-primary" />
                  Call Sentiment Distribution
                </CardTitle>
                <CardDescription>
                  Proportion of positive, neutral, and negative calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-100 border-green-200">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-green-700">Positive Calls</p>
                      <h4 className="text-2xl font-bold text-green-900 mt-1">{isLoading ? 'Loading...' : `${Math.round(analyticsData?.positiveCallsPercent || 0)}%`}</h4>
                      <div className="flex items-center text-green-500 mt-2">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>{isLoading ? 'Loading...' : '+12%'}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-100 border-gray-200">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-700">Neutral Calls</p>
                      <h4 className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? 'Loading...' : `${Math.round(analyticsData?.neutralCallsPercent || 0)}%`}</h4>
                      <div className="flex items-center text-gray-500 mt-2">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>{isLoading ? '+5%' : '+0%'}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-100 border-red-200">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-red-700">Negative Calls</p>
                      <h4 className="text-2xl font-bold text-red-900 mt-1">{isLoading ? 'Loading...' : `${Math.round(analyticsData?.negativeCallsPercent || 0)}%`}</h4>
                      <div className="flex items-center text-red-500 mt-2">
                        <ArrowDown className="h-4 w-4 mr-1" />
                        <span>{isLoading ? 'Loading...' : '-3%'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team">
            <TeamPerformanceMetrics isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="text-lg font-medium">Advanced Call Analytics</h3>
                  </div>
                  <AdvancedMetricsChart />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Talk-to-Listen Ratio Analysis
                  </CardTitle>
                  <CardDescription>
                    How much time are reps speaking vs. listening to prospects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading talk-to-listen ratio data...</p>
                  ) : (
                    <p>Talk-to-listen ratio data will be displayed here.</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-primary" />
                    Sentiment Progression
                  </CardTitle>
                  <CardDescription>
                    How call sentiment changes throughout conversations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading sentiment progression data...</p>
                  ) : (
                    <p>Sentiment progression data will be displayed here.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {isDemo && (
          <Button variant="secondary" onClick={demoAlert}>
            View Demo Alert
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Performance;
