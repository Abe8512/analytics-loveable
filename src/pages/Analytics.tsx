
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { 
  Download, FileDown, Calendar, ChevronDown, 
  BarChart2, PieChart as PieChartIcon, TrendingUp, 
  Activity, Zap, Target, Clock, AlertTriangle, FileCog
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCallTranscripts } from "@/services/CallTranscriptService";
import { 
  getMetrics, 
  getCallDistributionData, 
  getCallDistributionByHour,
  getSentimentTrendData,
  getScoreTrendData,
  getKeywordComparisonData
} from "@/services/CallTranscriptMetricsService";
import { DateRangeFilter } from "@/components/CallAnalysis/DateRangeFilter";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Colors for charts
const colors = {
  positive: "#10B981",
  neutral: "#6366F1",
  negative: "#EF4444",
  primary: "#6366F1",
  secondary: "#8B5CF6",
  tertiary: "#EC4899",
  quaternary: "#F59E0B",
  backgrounds: ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#14B8A6", "#0EA5E9", "#8B5CF6"]
};

const Analytics = () => {
  const { filters, updateDateRange } = useSharedFilters();
  const { toast } = useToast();
  const { transcripts, loading } = useCallTranscripts({
    startDate: filters.dateRange?.from,
    endDate: filters.dateRange?.to
  });
  
  const [timeFrame, setTimeFrame] = useState<"day" | "week" | "month" | "quarter">("week");
  const [metrics, setMetrics] = useState(getMetrics([]));
  const [callDistribution, setCallDistribution] = useState(getCallDistributionData([]));
  const [hourlyDistribution, setHourlyDistribution] = useState(getCallDistributionByHour([]));
  const [sentimentTrend, setSentimentTrend] = useState(getSentimentTrendData([]));
  const [scoreTrend, setScoreTrend] = useState(getScoreTrendData([]));
  const [keywordComparison, setKeywordComparison] = useState(getKeywordComparisonData([]));
  
  useEffect(() => {
    if (!loading && transcripts.length > 0) {
      setMetrics(getMetrics(transcripts));
      setCallDistribution(getCallDistributionData(transcripts));
      setHourlyDistribution(getCallDistributionByHour(transcripts));
      setSentimentTrend(getSentimentTrendData(transcripts));
      setScoreTrend(getScoreTrendData(transcripts));
      setKeywordComparison(getKeywordComparisonData(transcripts));
    }
  }, [loading, transcripts]);
  
  const handleExport = (format: 'pdf' | 'csv') => {
    toast({
      title: `Report ${format.toUpperCase()} Exported`,
      description: `Analytics report has been downloaded as ${format.toUpperCase()}`
    });
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border p-2 rounded-md shadow-md">
          <p className="font-medium text-xs">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const renderStatusBadge = (status: 'increase' | 'decrease' | 'stable') => {
    switch (status) {
      case 'increase':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">↑ Increasing</Badge>;
      case 'decrease':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/50">↓ Decreasing</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">→ Stable</Badge>;
    }
  };
  
  const renderQualityIndicator = (category: 'excellent' | 'good' | 'average' | 'poor') => {
    switch (category) {
      case 'excellent':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">Good</Badge>;
      case 'average':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Average</Badge>;
      case 'poor':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Needs Improvement</Badge>;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-gradient-to-r from-purple-900/20 to-blue-900/20 dark:from-purple-900/30 dark:to-blue-900/30 p-4 md:p-6 rounded-lg shadow-md">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Call Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive performance metrics and analytics insights
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <DateRangeFilter 
                dateRange={filters.dateRange} 
                setDateRange={updateDateRange}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                  <FileDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Export Analytics Report</AlertDialogTitle>
                  <AlertDialogDescription>
                    Choose the format for your analytics report export.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <Button 
                    className="h-24 flex flex-col items-center justify-center gap-2" 
                    variant="outline"
                    onClick={() => handleExport('pdf')}
                  >
                    <FileDown className="h-8 w-8" />
                    <span>PDF Report</span>
                  </Button>
                  <Button 
                    className="h-24 flex flex-col items-center justify-center gap-2" 
                    variant="outline"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="h-8 w-8" />
                    <span>CSV Data</span>
                  </Button>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading analytics data...</span>
          </div>
        )}
        
        {!loading && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.callMetrics.map((metric) => (
                <Card key={metric.name} className="shadow-md overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{metric.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-3xl font-bold">
                          {metric.name.includes('Rate') || metric.name.includes('Score') ? `${metric.value}%` : metric.value}
                        </div>
                        <div className="flex items-center mt-1">
                          <div className={`text-sm ${metric.status === 'increase' ? 'text-green-500' : metric.status === 'decrease' ? 'text-red-500' : 'text-yellow-500'}`}>
                            {metric.status === 'increase' ? '↑' : metric.status === 'decrease' ? '↓' : '→'}&nbsp;
                            {Math.abs(metric.change)}% vs previous {timeFrame}
                          </div>
                        </div>
                      </div>
                      <div>
                        {renderStatusBadge(metric.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Charts Section */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 mb-8">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span>Performance</span>
                </TabsTrigger>
                <TabsTrigger value="sentiment" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Sentiment</span>
                </TabsTrigger>
                <TabsTrigger value="keywords" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>Keywords</span>
                </TabsTrigger>
                <TabsTrigger value="timing" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Timing</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-1">
                  <FileCog className="h-4 w-4" />
                  <span>Advanced</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Call Distribution */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Call Distribution</span>
                        <BarChart2 className="h-5 w-5 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>Daily call volume over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={callDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="calls" name="Calls" fill={colors.primary} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Sentiment Distribution */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Sentiment Distribution</span>
                        <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>Call outcomes by sentiment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Positive', value: metrics.sentimentBreakdown.positive },
                                { name: 'Neutral', value: metrics.sentimentBreakdown.neutral },
                                { name: 'Negative', value: metrics.sentimentBreakdown.negative },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              <Cell fill={colors.positive} />
                              <Cell fill={colors.neutral} />
                              <Cell fill={colors.negative} />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Quality Metrics */}
                  <Card className="shadow-md overflow-hidden md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Call Quality Metrics</span>
                        <Activity className="h-5 w-5 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {metrics.qualityMetrics.map((metric) => (
                          <div key={metric.name} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{metric.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{metric.score}/{metric.maxScore}</span>
                                {renderQualityIndicator(metric.category)}
                              </div>
                            </div>
                            <Progress value={(metric.score / metric.maxScore) * 100} className="h-2" 
                              style={{
                                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                '--tw-progress-bar': metric.category === 'excellent' 
                                  ? colors.positive 
                                  : metric.category === 'good' 
                                    ? colors.primary 
                                    : metric.category === 'average' 
                                      ? colors.quaternary 
                                      : colors.negative
                              } as any}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Top Keywords */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Top Keywords</span>
                        <Target className="h-5 w-5 text-muted-foreground" />
                      </CardTitle>
                      <CardDescription>Most frequent topics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics.topKeywords.slice(0, 5).map((keyword, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full mr-2" 
                                style={{ backgroundColor: colors.backgrounds[index % colors.backgrounds.length] }} 
                              />
                              <span className="text-sm truncate max-w-[120px]">{keyword.keyword}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{keyword.count}</span>
                              <span className={`text-xs ${
                                keyword.trend === 'up' 
                                  ? 'text-green-500' 
                                  : keyword.trend === 'down' 
                                    ? 'text-red-500' 
                                    : 'text-yellow-500'
                              }`}>
                                {keyword.trend === 'up' ? '↑' : keyword.trend === 'down' ? '↓' : '→'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Score Trend */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Call Score Trend</CardTitle>
                      <CardDescription>Average call score over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={scoreTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="score"
                              name="Call Score"
                              stroke={colors.primary}
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Performance Radar */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>Multi-dimensional analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics.qualityMetrics}>
                            <PolarGrid stroke="#374151" opacity={0.2} />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar
                              name="Current Period"
                              dataKey="score"
                              stroke={colors.primary}
                              fill={colors.primary}
                              fillOpacity={0.5}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {metrics.comparisonMetrics.vsLastPeriod && (
                    <Card className="shadow-md overflow-hidden">
                      <CardHeader>
                        <CardTitle>vs Last Period</CardTitle>
                        <CardDescription>Percentage change</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(metrics.comparisonMetrics.vsLastPeriod).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className={`font-medium ${value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {value > 0 ? '+' : ''}{value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {metrics.comparisonMetrics.vsTeamAverage && (
                    <Card className="shadow-md overflow-hidden">
                      <CardHeader>
                        <CardTitle>vs Team Average</CardTitle>
                        <CardDescription>Percentage difference</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(metrics.comparisonMetrics.vsTeamAverage).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className={`font-medium ${value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {value > 0 ? '+' : ''}{value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Quality Score</CardTitle>
                      <CardDescription>Overall call performance</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-[200px]">
                      <div className="text-6xl font-bold text-primary">{Math.round(metrics.averageCallScore)}</div>
                      <div className="text-sm text-muted-foreground mt-2">out of 100</div>
                      <div className="mt-4 text-sm">
                        {metrics.averageCallScore >= 80
                          ? "Excellent performance"
                          : metrics.averageCallScore >= 70
                          ? "Good performance"
                          : metrics.averageCallScore >= 60
                          ? "Average performance"
                          : "Needs improvement"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Sentiment Tab */}
              <TabsContent value="sentiment" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sentiment Trend */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Sentiment Trend</CardTitle>
                      <CardDescription>Sentiment distribution over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sentimentTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="positive"
                              name="Positive"
                              stackId="1"
                              stroke={colors.positive}
                              fill={colors.positive}
                              fillOpacity={0.6}
                            />
                            <Area
                              type="monotone"
                              dataKey="neutral"
                              name="Neutral"
                              stackId="1"
                              stroke={colors.neutral}
                              fill={colors.neutral}
                              fillOpacity={0.6}
                            />
                            <Area
                              type="monotone"
                              dataKey="negative"
                              name="Negative"
                              stackId="1"
                              stroke={colors.negative}
                              fill={colors.negative}
                              fillOpacity={0.6}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Sentiment Breakdown */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Sentiment Analysis</CardTitle>
                      <CardDescription>Detailed sentiment breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                          <div className="text-2xl font-bold text-green-500">
                            {metrics.sentimentBreakdown.positive}
                          </div>
                          <div className="text-xs mt-1 text-center">Positive Calls</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="text-2xl font-bold text-blue-500">
                            {metrics.sentimentBreakdown.neutral}
                          </div>
                          <div className="text-xs mt-1 text-center">Neutral Calls</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                          <div className="text-2xl font-bold text-red-500">
                            {metrics.sentimentBreakdown.negative}
                          </div>
                          <div className="text-xs mt-1 text-center">Negative Calls</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Positive</span>
                            <span className="text-sm font-medium">
                              {metrics.sentimentBreakdown.positive > 0 && metrics.outcomeStats[3].count > 0
                                ? `${Math.round((metrics.sentimentBreakdown.positive / metrics.outcomeStats[3].count) * 100)}%`
                                : '0%'}
                            </span>
                          </div>
                          <Progress 
                            value={metrics.sentimentBreakdown.positive > 0 && metrics.outcomeStats[3].count > 0
                              ? (metrics.sentimentBreakdown.positive / metrics.outcomeStats[3].count) * 100
                              : 0
                            } 
                            className="h-2" 
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              '--tw-progress-bar': colors.positive
                            } as any}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Neutral</span>
                            <span className="text-sm font-medium">
                              {metrics.sentimentBreakdown.neutral > 0 && metrics.outcomeStats[3].count > 0
                                ? `${Math.round((metrics.sentimentBreakdown.neutral / metrics.outcomeStats[3].count) * 100)}%`
                                : '0%'}
                            </span>
                          </div>
                          <Progress 
                            value={metrics.sentimentBreakdown.neutral > 0 && metrics.outcomeStats[3].count > 0
                              ? (metrics.sentimentBreakdown.neutral / metrics.outcomeStats[3].count) * 100
                              : 0
                            } 
                            className="h-2" 
                            style={{
                              backgroundColor: 'rgba(99, 102, 241, 0.2)',
                              '--tw-progress-bar': colors.neutral
                            } as any}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Negative</span>
                            <span className="text-sm font-medium">
                              {metrics.sentimentBreakdown.negative > 0 && metrics.outcomeStats[3].count > 0
                                ? `${Math.round((metrics.sentimentBreakdown.negative / metrics.outcomeStats[3].count) * 100)}%`
                                : '0%'}
                            </span>
                          </div>
                          <Progress 
                            value={metrics.sentimentBreakdown.negative > 0 && metrics.outcomeStats[3].count > 0
                              ? (metrics.sentimentBreakdown.negative / metrics.outcomeStats[3].count) * 100
                              : 0
                            } 
                            className="h-2" 
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              '--tw-progress-bar': colors.negative
                            } as any}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-md overflow-hidden">
                  <CardHeader>
                    <CardTitle>Call Outcomes</CardTitle>
                    <CardDescription>Results breakdown by sentiment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left py-2 px-4 border-b">Outcome</th>
                            <th className="text-center py-2 px-4 border-b">Count</th>
                            <th className="text-center py-2 px-4 border-b">Percentage</th>
                            <th className="text-center py-2 px-4 border-b">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.outcomeStats.map((outcome, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                              <td className="py-2 px-4">{outcome.outcome}</td>
                              <td className="text-center py-2 px-4">{outcome.count}</td>
                              <td className="text-center py-2 px-4">{outcome.percentage}%</td>
                              <td className="text-center py-2 px-4">
                                {outcome.outcome === 'Qualified Leads' && (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                                    High Value
                                  </Badge>
                                )}
                                {outcome.outcome === 'Follow Up Required' && (
                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                                    Potential
                                  </Badge>
                                )}
                                {outcome.outcome === 'No Interest' && (
                                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                                    Lost
                                  </Badge>
                                )}
                                {outcome.outcome === 'Total' && (
                                  <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/30">
                                    Overview
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Keywords Tab */}
              <TabsContent value="keywords" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Keyword Comparison */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Keyword by Sentiment</CardTitle>
                      <CardDescription>Keywords in positive vs negative calls</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={keywordComparison}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis type="number" />
                            <YAxis dataKey="keyword" type="category" width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="positive" name="Positive Calls" fill={colors.positive} />
                            <Bar dataKey="negative" name="Negative Calls" fill={colors.negative} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Keywords by Category */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Keywords by Category</CardTitle>
                      <CardDescription>Topics grouped by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Group keywords by category */}
                        {(() => {
                          const categories: {[key: string]: typeof metrics.topKeywords} = {};
                          metrics.topKeywords.forEach(keyword => {
                            const category = keyword.category || 'Other';
                            if (!categories[category]) {
                              categories[category] = [];
                            }
                            categories[category].push(keyword);
                          });
                          
                          return Object.entries(categories).map(([category, keywords]) => (
                            <div key={category} className="space-y-3">
                              <h3 className="text-sm font-medium">{category}</h3>
                              {keywords.map((keyword, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div 
                                      className="h-2 w-2 rounded-full mr-2" 
                                      style={{ 
                                        backgroundColor: category === 'Product' 
                                          ? colors.primary 
                                          : category === 'Pain Points' 
                                            ? colors.negative 
                                            : category === 'Competition' 
                                              ? colors.quaternary 
                                              : colors.secondary
                                      }} 
                                    />
                                    <span className="text-sm">{keyword.keyword}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium mr-2">{keyword.count}</span>
                                    <span className={`text-xs ${
                                      keyword.trend === 'up' 
                                        ? 'text-green-500' 
                                        : keyword.trend === 'down' 
                                          ? 'text-red-500' 
                                          : 'text-yellow-500'
                                    }`}>
                                      {keyword.trend === 'up' ? '↑' : keyword.trend === 'down' ? '↓' : '→'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              <Separator />
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-md overflow-hidden">
                  <CardHeader>
                    <CardTitle>Top Keywords Analysis</CardTitle>
                    <CardDescription>Detailed breakdown of frequently mentioned topics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left py-2 px-4 border-b">Keyword</th>
                            <th className="text-center py-2 px-4 border-b">Count</th>
                            <th className="text-center py-2 px-4 border-b">Trend</th>
                            <th className="text-center py-2 px-4 border-b">Category</th>
                            <th className="text-center py-2 px-4 border-b">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.topKeywords.map((keyword, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                              <td className="py-2 px-4">{keyword.keyword}</td>
                              <td className="text-center py-2 px-4">{keyword.count}</td>
                              <td className="text-center py-2 px-4">
                                <span className={`${
                                  keyword.trend === 'up' 
                                    ? 'text-green-500' 
                                    : keyword.trend === 'down' 
                                      ? 'text-red-500' 
                                      : 'text-yellow-500'
                                }`}>
                                  {keyword.trend === 'up' ? '↑ Rising' : keyword.trend === 'down' ? '↓ Falling' : '→ Stable'}
                                </span>
                              </td>
                              <td className="text-center py-2 px-4">
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    keyword.category === 'Product' 
                                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' 
                                      : keyword.category === 'Pain Points' 
                                        ? 'bg-red-500/10 text-red-500 border-red-500/30' 
                                        : keyword.category === 'Competition' 
                                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' 
                                          : keyword.category === 'Timeline' 
                                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                                            : 'bg-gray-500/10 text-gray-500 border-gray-500/30'
                                  }`}
                                >
                                  {keyword.category || 'Other'}
                                </Badge>
                              </td>
                              <td className="text-center py-2 px-4">
                                <Button variant="ghost" size="sm">Analyze</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Timing Tab */}
              <TabsContent value="timing" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hourly Distribution */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Call Distribution by Hour</CardTitle>
                      <CardDescription>When calls are most frequent</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={hourlyDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="count" name="Calls" fill={colors.secondary} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Time of Day */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Time of Day Analysis</CardTitle>
                      <CardDescription>Call performance by time period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Morning (5-12)', value: metrics.timeMetrics.timeOfDayDistribution.morning },
                                { name: 'Afternoon (12-18)', value: metrics.timeMetrics.timeOfDayDistribution.afternoon },
                                { name: 'Evening (18-5)', value: metrics.timeMetrics.timeOfDayDistribution.evening },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              <Cell fill={colors.primary} />
                              <Cell fill={colors.secondary} />
                              <Cell fill={colors.tertiary} />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-md overflow-hidden">
                  <CardHeader>
                    <CardTitle>Duration Analysis</CardTitle>
                    <CardDescription>Call duration metrics and insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Average Duration</h3>
                        <div className="text-4xl font-bold">{Math.floor(metrics.timeMetrics.avgDuration / 60)}:{(metrics.timeMetrics.avgDuration % 60).toString().padStart(2, '0')}</div>
                        <p className="text-sm text-muted-foreground">minutes:seconds</p>
                        <div className="flex items-center text-sm">
                          <span className={metrics.callMetrics[2].status === 'increase' ? 'text-green-500' : 'text-red-500'}>
                            {metrics.callMetrics[2].status === 'increase' ? '↑' : '↓'} {Math.abs(metrics.callMetrics[2].change)}%
                          </span>
                          <span className="text-muted-foreground ml-1">vs. previous period</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Total Call Time</h3>
                        <div className="text-4xl font-bold">
                          {Math.floor(metrics.timeMetrics.totalCallTime / 3600)}:{Math.floor((metrics.timeMetrics.totalCallTime % 3600) / 60).toString().padStart(2, '0')}
                        </div>
                        <p className="text-sm text-muted-foreground">hours:minutes</p>
                        <div className="text-sm text-muted-foreground">
                          Across {metrics.outcomeStats[3].count} calls
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Duration Insights</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Short Calls (&lt;5 min)</span>
                            <span>24%</span>
                          </div>
                          <Progress value={24} className="h-1" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Medium Calls (5-15 min)</span>
                            <span>58%</span>
                          </div>
                          <Progress value={58} className="h-1" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Long Calls (&gt;15 min)</span>
                            <span>18%</span>
                          </div>
                          <Progress value={18} className="h-1" />
                          
                          <div className="text-sm text-muted-foreground mt-2">
                            Medium length calls (5-15 min) have the highest conversion rate
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Advanced Metrics */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Advanced Performance Metrics</CardTitle>
                      <CardDescription>In-depth analysis parameters</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Talk-to-Listen Ratio</span>
                            <span className="text-sm font-medium">45:55</span>
                          </div>
                          <div className="flex w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="bg-blue-500" style={{ width: '45%' }}></div>
                            <div className="bg-green-500" style={{ width: '55%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Agent (45%)</span>
                            <span>Customer (55%)</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Question Types</span>
                            <span className="text-sm font-medium">15 questions/call</span>
                          </div>
                          <div className="flex w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="bg-purple-500" style={{ width: '65%' }}></div>
                            <div className="bg-yellow-500" style={{ width: '35%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Open-ended (65%)</span>
                            <span>Closed-ended (35%)</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Filler Words</span>
                            <span className="text-sm font-medium">12 per call</span>
                          </div>
                          <Progress value={37} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            37% reduction from previous period
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Silence Utilization</span>
                            <span className="text-sm font-medium">Effective</span>
                          </div>
                          <Progress value={85} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            Strategic pauses used effectively
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Energy/Enthusiasm</span>
                            <span className="text-sm font-medium">High</span>
                          </div>
                          <Progress value={78} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            Good vocal variety and engagement
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Objection Handling */}
                  <Card className="shadow-md overflow-hidden">
                    <CardHeader>
                      <CardTitle>Objection & Pain Point Analysis</CardTitle>
                      <CardDescription>Handling effectiveness & identification</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Objection Handling */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Objection Handling Effectiveness</h3>
                          <div className="flex items-center">
                            <div className="w-full bg-muted rounded-full h-4 mr-2">
                              <div 
                                className="bg-blue-500 h-4 rounded-full" 
                                style={{ width: '76%' }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">76%</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted-foreground">Detected: 34 objections</span>
                            <span className="text-xs text-muted-foreground">Successfully handled: 26</span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Top Objections</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Pricing concerns</span>
                              <span className="text-sm font-medium">42%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Implementation timeline</span>
                              <span className="text-sm font-medium">28%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Feature limitations</span>
                              <span className="text-sm font-medium">16%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Other concerns</span>
                              <span className="text-sm font-medium">14%</span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Pain Point Identification</h3>
                          <div className="flex items-center">
                            <div className="w-full bg-muted rounded-full h-4 mr-2">
                              <div 
                                className="bg-green-500 h-4 rounded-full" 
                                style={{ width: '82%' }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">82%</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Effectively identified and explored customer pain points
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Key Pain Points Identified</h3>
                          <div className="space-y-2">
                            <Badge className="mr-2 mb-2">Process inefficiency</Badge>
                            <Badge className="mr-2 mb-2">Integration challenges</Badge>
                            <Badge className="mr-2 mb-2">Reporting limitations</Badge>
                            <Badge className="mr-2 mb-2">User adoption</Badge>
                            <Badge className="mr-2 mb-2">Data management</Badge>
                            <Badge className="mr-2 mb-2">Support responsiveness</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="shadow-md overflow-hidden">
                  <CardHeader>
                    <CardTitle>Closing Techniques & Value Proposition</CardTitle>
                    <CardDescription>Analysis of closing effectiveness and value delivery</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-md font-medium">Closing Techniques</h3>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Assumptive Close</span>
                            <span className="text-sm font-medium">38%</span>
                          </div>
                          <Progress value={38} className="h-1.5" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Summary Close</span>
                            <span className="text-sm font-medium">22%</span>
                          </div>
                          <Progress value={22} className="h-1.5" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Question Close</span>
                            <span className="text-sm font-medium">18%</span>
                          </div>
                          <Progress value={18} className="h-1.5" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Urgency Close</span>
                            <span className="text-sm font-medium">12%</span>
                          </div>
                          <Progress value={12} className="h-1.5" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Other Techniques</span>
                            <span className="text-sm font-medium">10%</span>
                          </div>
                          <Progress value={10} className="h-1.5" />
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Overall Closing Score</span>
                            <span className="text-sm font-medium">72/100</span>
                          </div>
                          <Progress value={72} className="h-2" />
                          <div className="flex justify-between mt-2">
                            <span className="text-xs text-muted-foreground">Next steps proposed: 86%</span>
                            <span className="text-xs text-muted-foreground">Commitment obtained: 43%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-md font-medium">Value Proposition Delivery</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-sm">Clarity</span>
                            <div className="flex items-center">
                              <Progress value={84} className="h-2 flex-1 mr-2" />
                              <span className="text-sm font-medium">84%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-sm">Customization</span>
                            <div className="flex items-center">
                              <Progress value={76} className="h-2 flex-1 mr-2" />
                              <span className="text-sm font-medium">76%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-sm">Repetition</span>
                            <div className="flex items-center">
                              <Progress value={68} className="h-2 flex-1 mr-2" />
                              <span className="text-sm font-medium">68%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-sm">Effectiveness</span>
                            <div className="flex items-center">
                              <Progress value={79} className="h-2 flex-1 mr-2" />
                              <span className="text-sm font-medium">79%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h3 className="text-sm font-medium mb-2">Key Value Points</h3>
                          <div className="space-y-2">
                            <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/30 text-sm">
                              Cost savings up to 30% compared to current solution
                            </div>
                            <div className="p-2 rounded-md bg-green-500/10 border border-green-500/30 text-sm">
                              Implementation in under 2 weeks with dedicated support
                            </div>
                            <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/30 text-sm">
                              Seamless integration with existing tools and workflows
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
