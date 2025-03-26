
import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, Pie, Cell,
  PieChart as RechartsPieChart 
} from 'recharts';
import { TeamMetricsData, RepMetricsData } from '@/services/SharedDataService';
import { getTeamMetrics, getRepMetrics, getAnalyticsData, AnalyticsData } from '@/services/AnalyticsService';

const Analytics = () => {
  const { isAdmin, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [loading, setLoading] = useState(true);
  
  const [teamMetrics, setTeamMetrics] = useState<TeamMetricsData>({
    totalCalls: 0,
    avgSentiment: 0.5,
    avgTalkRatio: { agent: 50, customer: 50 },
    topKeywords: [],
    performanceScore: 0,
    conversionRate: 0
  });
  
  const [repMetrics, setRepMetrics] = useState<RepMetricsData[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    pipelineData: [],
    conversionData: [],
    revenueData: [],
    productMixData: []
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teamData, repData, analyticsData] = await Promise.all([
          getTeamMetrics(),
          getRepMetrics(),
          getAnalyticsData()
        ]);
        
        setTeamMetrics(teamData);
        setRepMetrics(repData);
        setAnalyticsData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Colors for pipeline chart
  const PIPELINE_COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
  
  // Colors for product mix chart
  const PRODUCT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C'];
  
  // Rep performance data
  const repPerformanceData = repMetrics.map(rep => ({
    name: rep.name,
    successRate: rep.successRate,
    sentiment: Math.round(rep.sentiment * 100),
    callVolume: rep.callVolume
  }));
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sales Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights for your sales performance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{loading ? <Skeleton className="h-8 w-24" /> : teamMetrics.performanceScore}</CardTitle>
            <CardDescription>Performance Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {loading ? <Skeleton className="h-4 w-full" /> : 'Based on call quality and outcomes'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{loading ? <Skeleton className="h-8 w-24" /> : teamMetrics.totalCalls}</CardTitle>
            <CardDescription>Total Calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {loading ? <Skeleton className="h-4 w-full" /> : 'Across all sales representatives'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{loading ? <Skeleton className="h-8 w-24" /> : `${teamMetrics.conversionRate}%`}</CardTitle>
            <CardDescription>Conversion Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {loading ? <Skeleton className="h-4 w-full" /> : 'Calls resulting in next steps'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="pipeline" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="product">Product Mix</TabsTrigger>
          {(isAdmin || isManager) && (
            <TabsTrigger value="rep">Rep Performance</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="pipeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline</CardTitle>
              <CardDescription>Current distribution of opportunities by stage</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Opportunities" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate Trend</CardTitle>
              <CardDescription>Monthly conversion rate percentage</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      name="Conversion Rate (%)" 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Performance</CardTitle>
              <CardDescription>Actual vs target revenue by month</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual" name="Actual Revenue" fill="#8884d8" />
                    <Bar dataKey="target" name="Target Revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="product" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Mix</CardTitle>
              <CardDescription>Distribution of sales by product</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.productMixData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.productMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {(isAdmin || isManager) && (
          <TabsContent value="rep" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rep Performance</CardTitle>
                <CardDescription>Success rate and call volume by representative</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={repPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="successRate" name="Success Rate (%)" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="callVolume" name="Call Volume" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>Average sentiment score: {loading ? <Skeleton className="h-4 w-16 inline-block" /> : teamMetrics.avgSentiment.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Positive</span>
                  <span className="text-green-500 font-medium">
                    {(teamMetrics.avgSentiment > 0.66 ? teamMetrics.avgSentiment * 100 : 32).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${teamMetrics.avgSentiment > 0.66 ? teamMetrics.avgSentiment * 100 : 32}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Neutral</span>
                  <span className="text-blue-500 font-medium">
                    {(teamMetrics.avgSentiment > 0.33 && teamMetrics.avgSentiment <= 0.66 ? teamMetrics.avgSentiment * 100 : 45).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${teamMetrics.avgSentiment > 0.33 && teamMetrics.avgSentiment <= 0.66 ? teamMetrics.avgSentiment * 100 : 45}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Negative</span>
                  <span className="text-red-500 font-medium">
                    {(teamMetrics.avgSentiment <= 0.33 ? teamMetrics.avgSentiment * 100 : 23).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full" 
                    style={{ width: `${teamMetrics.avgSentiment <= 0.33 ? teamMetrics.avgSentiment * 100 : 23}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
            <CardDescription>Most frequently mentioned terms in calls</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-4">
                {teamMetrics.topKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{keyword}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(100 - index * 15)}% of calls
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
