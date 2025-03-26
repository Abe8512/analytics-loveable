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

// Mock data function that returns data with the correct shape
const getMockTeamMetrics = (): TeamMetricsData => ({
  totalCalls: 128,
  avgSentiment: 0.72,
  avgTalkRatio: { agent: 55, customer: 45 },
  topKeywords: ['pricing', 'features', 'support', 'implementation', 'integration'],
  performanceScore: 72,
  conversionRate: 45
});

// Mock rep data with the correct shape
const getMockRepMetrics = (): RepMetricsData[] => [
  {
    id: "1",
    name: "Alex Johnson",
    callVolume: 145,
    successRate: 72,
    sentiment: 0.85,
    insights: ["Excellent rapport building", "Good at overcoming objections"]
  },
  {
    id: "2",
    name: "Maria Garcia",
    callVolume: 128,
    successRate: 68,
    sentiment: 0.79,
    insights: ["Strong product knowledge", "Could improve closing"]
  },
  {
    id: "3",
    name: "David Kim",
    callVolume: 103,
    successRate: 62,
    sentiment: 0.72,
    insights: ["Good discovery questions", "Needs work on follow-up"]
  }
];

const Analytics = () => {
  const { isAdmin, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [loading, setLoading] = useState(true);
  
  // Use the mocked data with the correct type structure
  const [teamMetrics, setTeamMetrics] = useState<TeamMetricsData>(getMockTeamMetrics());
  const [repMetrics, setRepMetrics] = useState<RepMetricsData[]>(getMockRepMetrics());
  
  useEffect(() => {
    // Simulate API loading
    setLoading(true);
    setTimeout(() => {
      setTeamMetrics(getMockTeamMetrics());
      setRepMetrics(getMockRepMetrics());
      setLoading(false);
    }, 1500);
  }, []);
  
  // Pipeline data
  const pipelineData = [
    { name: 'Leads', value: 120 },
    { name: 'Qualified', value: 85 },
    { name: 'Proposal', value: 42 },
    { name: 'Negotiation', value: 28 },
    { name: 'Closed', value: 18 },
  ];
  
  // Colors for pipeline chart
  const PIPELINE_COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
  
  // Conversion data
  const conversionData = [
    { name: 'Jan', rate: 32 },
    { name: 'Feb', rate: 38 },
    { name: 'Mar', rate: 30 },
    { name: 'Apr', rate: 42 },
    { name: 'May', rate: 35 },
    { name: 'Jun', rate: 48 },
    { name: 'Jul', rate: 50 },
    { name: 'Aug', rate: 45 },
  ];
  
  // Revenue data
  const revenueData = [
    { name: 'Jan', actual: 4000, target: 4500 },
    { name: 'Feb', actual: 5000, target: 4500 },
    { name: 'Mar', actual: 3500, target: 4500 },
    { name: 'Apr', actual: 6000, target: 5000 },
    { name: 'May', actual: 5500, target: 5000 },
    { name: 'Jun', actual: 7000, target: 5500 },
    { name: 'Jul', actual: 6500, target: 5500 },
    { name: 'Aug', actual: 8000, target: 6000 },
  ];
  
  // Product mix data
  const productMixData = [
    { name: 'Product A', value: 35 },
    { name: 'Product B', value: 25 },
    { name: 'Product C', value: 20 },
    { name: 'Product D', value: 15 },
    { name: 'Other', value: 5 },
  ];
  
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
                  <BarChart data={pipelineData}>
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
                  <LineChart data={conversionData}>
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
                  <BarChart data={revenueData}>
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
                      data={productMixData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productMixData.map((entry, index) => (
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
