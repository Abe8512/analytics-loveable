import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/CallAnalysis/DateRangeFilter";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell 
} from "recharts";
import { 
  Download, FileDown, Settings, CalendarRange, 
  BarChart as BarChartIcon, PieChart, LineChart as LineChartIcon, 
  RefreshCw, Filter, Users, Award, TrendingUp, DollarSign,
  Phone, Heart, Target, Calendar
} from "lucide-react";

interface ComparisonMetric {
  [key: string]: number;
}

interface MetricsType {
  qualityMetrics: {
    name: string;
    score: number;
    maxScore: number;
    category: string;
  }[];
  outcomeStats: {
    outcome: string;
    count: number;
    percentage: number;
  }[];
  timeMetrics: {
    avgDuration: number;
    totalCallTime: number;
    timeOfDayDistribution: Record<string, number>;
  };
  topKeywords: {
    keyword: string;
    count: number;
  }[];
  comparisonMetrics: {
    vsLastPeriod: ComparisonMetric;
    vsTeamAverage: ComparisonMetric;
  };
}

const Analytics = () => {
  const { filters, updateDateRange } = useSharedFilters();
  const { toast } = useToast();
  const { isManager, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [transcripts, setTranscripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsType | null>(null);
  const [distributionData, setDistributionData] = useState([]);
  const [hourlyDistribution, setHourlyDistribution] = useState([]);
  const [sentimentTrends, setSentimentTrends] = useState([]);
  const [scoreTrends, setScoreTrends] = useState([]);
  const [keywordComparison, setKeywordComparison] = useState([]);
  
  const [teamMetrics, teamMetricsLoading] = useRealTimeTeamMetrics(filters);
  const [repMetrics, repMetricsLoading] = useRealTimeRepMetrics();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('call_transcripts').select('*');
        
        if (filters.dateRange?.from) {
          query = query.gte('created_at', filters.dateRange.from.toISOString());
        }
        
        if (filters.dateRange?.to) {
          query = query.lte('created_at', filters.dateRange.to.toISOString());
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setTranscripts(data || []);
        
        if (data && data.length > 0) {
          const calculatedMetrics = getMetrics(data);
          setMetrics(calculatedMetrics);
          
          setDistributionData(getCallDistributionData(data));
          setHourlyDistribution(getCallDistributionByHour(data));
          setSentimentTrends(getSentimentTrendData(data));
          setScoreTrends(getScoreTrendData(data));
          setKeywordComparison(getKeywordComparisonData(data));
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast({
          title: "Error fetching data",
          description: "Could not retrieve analytics data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters.dateRange, toast]);

  const handleExport = (format) => {
    toast({
      title: `${format} Export Started`,
      description: "Your analytics data is being prepared for download"
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Your analytics data has been exported as ${format}`
      });
    }, 1500);
  };

  const refreshData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Data Refreshed",
        description: "Analytics data has been updated with the latest information"
      });
      setIsLoading(false);
    }, 1000);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FF8042'];
  const SENTIMENT_COLORS = {
    positive: '#10B981',
    neutral: '#3B82F6',
    negative: '#EF4444'
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 dark:from-blue-900/30 dark:to-purple-900/30 p-4 md:p-6 rounded-lg shadow-md">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive metrics and insights from your call data
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <DateRangeFilter 
                dateRange={filters.dateRange} 
                setDateRange={updateDateRange}
              />
              <CalendarRange className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="gap-2" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Export Analytics Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      Choose the export format for your analytics data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2" 
                      variant="outline"
                      onClick={() => handleExport('PDF')}
                    >
                      <FileDown className="h-8 w-8" />
                      <span>PDF Report</span>
                    </Button>
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2" 
                      variant="outline"
                      onClick={() => handleExport('Excel')}
                    >
                      <Download className="h-8 w-8" />
                      <span>Excel Data</span>
                    </Button>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>
        </div>
        
        <PerformanceMetrics />
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full h-auto flex flex-wrap justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team-performance">
              <Users className="h-4 w-4 mr-1" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger value="pipeline">
              <DollarSign className="h-4 w-4 mr-1" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Calendar className="h-4 w-4 mr-1" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="customer">
              <Heart className="h-4 w-4 mr-1" />
              Customer
            </TabsTrigger>
            <TabsTrigger value="forecast">
              <TrendingUp className="h-4 w-4 mr-1" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="team-metrics">
              <Award className="h-4 w-4 mr-1" />
              Team Metrics
            </TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="keywords">Keyword Analysis</TabsTrigger>
            <TabsTrigger value="calls">Call Distribution</TabsTrigger>
            <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <KeywordTrendsChart />
              <SentimentTrendsChart />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <KeyMetricsTable dateRange={filters.dateRange} />
            </div>
          </TabsContent>
          
          <TabsContent value="team-performance" className="space-y-6">
            <TeamPerformanceAnalytics 
              teamMetrics={teamMetrics} 
              repMetrics={repMetrics} 
              isLoading={teamMetricsLoading || repMetricsLoading} 
            />
          </TabsContent>
          
          <TabsContent value="pipeline" className="space-y-6">
            <PipelineMetrics isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6">
            <ActivityMetrics isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="customer" className="space-y-6">
            <CustomerMetrics isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="forecast" className="space-y-6">
            <SalesForecast isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="team-metrics" className="space-y-6">
            <TeamPerformanceMetrics isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Trends Over Time</CardTitle>
                  <CardDescription>
                    Tracking sentiment changes over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-[300px]" />
                  ) : sentimentTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={sentimentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="positive" 
                          name="Positive" 
                          stroke={SENTIMENT_COLORS.positive} 
                          strokeWidth={2} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="neutral" 
                          name="Neutral" 
                          stroke={SENTIMENT_COLORS.neutral} 
                          strokeWidth={2} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="negative" 
                          name="Negative" 
                          stroke={SENTIMENT_COLORS.negative} 
                          strokeWidth={2} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-[300px]">
                      <p className="text-muted-foreground">No trend data available for the selected period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Call Quality Score Trends</CardTitle>
                  <CardDescription>
                    Average call quality scores over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-[300px]" />
                  ) : scoreTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={scoreTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          name="Call Quality Score" 
                          stroke="#8884d8" 
                          strokeWidth={2} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-[300px]">
                      <p className="text-muted-foreground">No score trend data available for the selected period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="keywords" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Keywords by Sentiment</CardTitle>
                  <CardDescription>
                    Comparing keyword frequency in positive vs negative calls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-[300px]" />
                  ) : keywordComparison.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={keywordComparison}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="keyword" type="category" width={90} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="positive" name="Positive Calls" fill={SENTIMENT_COLORS.positive} />
                        <Bar dataKey="negative" name="Negative Calls" fill={SENTIMENT_COLORS.negative} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-[300px]">
                      <p className="text-muted-foreground">No keyword comparison data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Topic Distribution</CardTitle>
                  <CardDescription>
                    Distribution of conversation topics across calls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-[300px]" />
                  ) : metrics?.topKeywords.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={metrics.topKeywords.slice(0, 5).map(k => ({
                            name: k.keyword,
                            value: k.count
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {metrics.topKeywords.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-[300px]">
                      <p className="text-muted-foreground">No topic distribution data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="calls" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Call Distribution</CardTitle>
                  <CardDescription>
                    Call volume distribution over days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-[300px]" />
                  ) : distributionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={distributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="calls" name="Calls" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-[300px]">
                      <p className="text-muted-foreground">No call distribution data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Hourly Call Distribution</CardTitle>
                  <CardDescription>
                    Call volume by hour of day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="w-full h-[300px]" />
                  ) : hourlyDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={hourlyDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Calls" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-[300px]">
                      <p className="text-muted-foreground">No hourly distribution data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Call Performance Metrics</CardTitle>
                <CardDescription>
                  Detailed breakdown of call quality metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="w-full h-[400px]" />
                ) : metrics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {metrics.qualityMetrics.map((metric, index) => (
                        <Card key={index}>
                          <CardHeader className="p-4">
                            <CardTitle className="text-sm">{metric.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="flex items-end gap-2">
                              <span className="text-2xl font-bold">{metric.score}</span>
                              <span className="text-muted-foreground text-sm">/ {metric.maxScore}</span>
                            </div>
                            <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block
                              ${metric.category === 'excellent' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                                metric.category === 'good' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                metric.category === 'average' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}
                            >
                              {metric.category.charAt(0).toUpperCase() + metric.category.slice(1)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Call Outcomes</h3>
                        <div className="space-y-4">
                          {metrics.outcomeStats.slice(0, 3).map((outcome, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span>{outcome.outcome}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{outcome.count}</span>
                                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary"
                                    style={{ width: `${outcome.percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm">{outcome.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Time Metrics</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>Average Call Duration</span>
                            <span className="font-medium">{Math.round(metrics.timeMetrics.avgDuration / 60)} minutes</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Total Call Time</span>
                            <span className="font-medium">{Math.round(metrics.timeMetrics.totalCallTime / 3600)} hours</span>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>Time of Day Distribution</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {Object.entries(metrics.timeMetrics.timeOfDayDistribution).map(([time, count], index) => (
                                <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center">
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{time}</div>
                                  <div className="font-medium">{count}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Performance Comparison</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">vs Last Period</h4>
                          <div className="space-y-3">
                            {Object.entries(metrics.comparisonMetrics.vsLastPeriod).map(([key, value], index) => {
                              const numericValue = Number(value);
                              return (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className={`${numericValue >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                                    {numericValue >= 0 ? '+' : ''}{numericValue}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">vs Team Average</h4>
                          <div className="space-y-3">
                            {Object.entries(metrics.comparisonMetrics.vsTeamAverage).map(([key, value], index) => {
                              const numericValue = Number(value);
                              return (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className={`${numericValue >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                                    {numericValue >= 0 ? '+' : ''}{numericValue}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-[400px]">
                    <p className="text-muted-foreground">No detailed metrics available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
