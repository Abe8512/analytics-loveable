
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamMetrics, RepMetrics } from "@/services/RealTimeMetricsService";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, User, Award, TrendingUp, Phone, Zap, MessageSquare, Activity } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import GlowingCard from "../ui/GlowingCard";
import { cn } from "@/lib/utils";
import AnimatedNumber from '../ui/AnimatedNumber';

interface TeamPerformanceAnalyticsProps {
  teamMetrics: TeamMetrics;
  repMetrics: RepMetrics[];
  isLoading: boolean;
}

const TeamPerformanceAnalytics: React.FC<TeamPerformanceAnalyticsProps> = ({ 
  teamMetrics, 
  repMetrics, 
  isLoading 
}) => {
  const sortedRepsByPerformance = useMemo(() => {
    return [...repMetrics].sort((a, b) => b.successRate - a.successRate);
  }, [repMetrics]);

  const topPerformers = useMemo(() => {
    return sortedRepsByPerformance.slice(0, 3);
  }, [sortedRepsByPerformance]);

  const performanceData = useMemo(() => {
    return repMetrics.map(rep => ({
      name: rep.name,
      successRate: rep.successRate,
      sentiment: Math.round(rep.sentiment * 100),
      callVolume: rep.callVolume
    }));
  }, [repMetrics]);

  const sentimentDistribution = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    
    repMetrics.forEach(rep => {
      if (rep.sentiment > 0.7) positive++;
      else if (rep.sentiment > 0.4) neutral++;
      else negative++;
    });
    
    return [
      { name: 'Positive', value: positive, color: '#06D6A0' },
      { name: 'Neutral', value: neutral, color: '#FFD166' },
      { name: 'Negative', value: negative, color: '#EF476F' }
    ];
  }, [repMetrics]);

  const callVolumeByRep = useMemo(() => {
    return repMetrics
      .sort((a, b) => b.callVolume - a.callVolume)
      .slice(0, 5)
      .map(rep => ({
        name: rep.name.split(' ')[0], // Use first name only to save space
        calls: rep.callVolume
      }));
  }, [repMetrics]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-foreground">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.fill }} className="text-sm">
              {`${entry.name}: ${entry.value}${entry.name === 'Success Rate' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlowingCard gradient="blue" variant="bordered" className="h-full">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-400">Team Size</h3>
              <div className="p-2 rounded-full bg-blue-500/10 dark:bg-blue-500/20">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="mb-2">
                <AnimatedNumber 
                  value={repMetrics.length} 
                  className="text-3xl font-bold text-foreground"
                />
                <p className="text-sm text-muted-foreground">Active team members</p>
              </div>
            )}
          </div>
        </GlowingCard>

        <GlowingCard gradient="purple" variant="bordered" className="h-full">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-400">Avg. Success Rate</h3>
              <div className="p-2 rounded-full bg-purple-500/10 dark:bg-purple-500/20">
                <Award className="h-4 w-4 text-purple-500" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="mb-2">
                <AnimatedNumber 
                  value={Math.round(
                    repMetrics.reduce((sum, rep) => sum + rep.successRate, 0) / 
                    (repMetrics.length || 1)
                  )} 
                  className="text-3xl font-bold text-foreground"
                  suffix="%"
                />
                <p className="text-sm text-muted-foreground">Team average</p>
              </div>
            )}
          </div>
        </GlowingCard>

        <GlowingCard gradient="green" variant="bordered" className="h-full">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-400">Avg. Sentiment</h3>
              <div className="p-2 rounded-full bg-green-500/10 dark:bg-green-500/20">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="mb-2">
                <AnimatedNumber 
                  value={Math.round(
                    repMetrics.reduce((sum, rep) => sum + rep.sentiment, 0) / 
                    (repMetrics.length || 1) * 100
                  )} 
                  className="text-3xl font-bold text-foreground"
                  suffix="%"
                />
                <p className="text-sm text-muted-foreground">Positive customer interactions</p>
              </div>
            )}
          </div>
        </GlowingCard>
      </div>

      {/* Top Performers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Top Performers
          </CardTitle>
          <CardDescription>Team members with the highest success rates</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {topPerformers.map((rep, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/40 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-full mr-4 text-white font-bold",
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-slate-400" : 
                      "bg-amber-700"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{rep.name}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" /> {rep.callVolume} calls
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">{rep.successRate}%</div>
                    <div className={cn(
                      "text-sm",
                      rep.sentiment > 0.7 ? "text-green-500" : 
                      rep.sentiment > 0.4 ? "text-yellow-500" : 
                      "text-red-500"
                    )}>
                      {Math.round(rep.sentiment * 100)}% sentiment
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-purple-500" />
              Success Rate by Team Member
            </CardTitle>
            <CardDescription>
              Performance comparison across the team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={performanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ 
                      value: "Success Rate (%)", 
                      angle: -90, 
                      position: "insideLeft",
                      style: { textAnchor: 'middle' } 
                    }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar name="Success Rate" dataKey="successRate" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.successRate > 70 ? "#8B5CF6" : 
                              entry.successRate > 50 ? "#A78BFA" : "#C4B5FD"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Call Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-blue-500" />
              Call Volume Distribution
            </CardTitle>
            <CardDescription>
              Total calls handled by top team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={callVolumeByRep}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    label={{ 
                      value: "Number of Calls", 
                      angle: -90, 
                      position: "insideLeft",
                      style: { textAnchor: 'middle' } 
                    }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar name="Calls" dataKey="calls" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Sentiment Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              Team Sentiment Distribution
            </CardTitle>
            <CardDescription>
              Distribution of positive, neutral, and negative sentiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sentimentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Performance and Sentiment Combined Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-pink-500" />
              Success Rate vs. Sentiment
            </CardTitle>
            <CardDescription>
              Correlation between success rate and customer sentiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={performanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ 
                      value: "Success Rate (%)", 
                      angle: -90, 
                      position: "insideLeft",
                      style: { textAnchor: 'middle' } 
                    }} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ 
                      value: "Sentiment Score (%)", 
                      angle: 90, 
                      position: "insideRight", 
                      style: { textAnchor: 'middle' } 
                    }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    name="Success Rate" 
                    dataKey="successRate" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    name="Sentiment" 
                    dataKey="sentiment" 
                    stroke="#06D6A0" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Team Performance Insights
          </CardTitle>
          <CardDescription>
            Key observations based on team performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
                <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Top Performer</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {topPerformers[0]?.name || "N/A"} leads with {topPerformers[0]?.successRate || 0}% success rate and 
                  {" "}{Math.round((topPerformers[0]?.sentiment || 0) * 100)}% positive sentiment.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-100 dark:border-purple-900">
                <h3 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Team Sentiment</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {sentimentDistribution[0].value} team members maintain positive customer interactions above 70%.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-100 dark:border-green-900">
                <h3 className="font-medium text-green-700 dark:text-green-400 mb-2">Call Volume Leader</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {callVolumeByRep[0]?.name || "N/A"} handled the most calls at {callVolumeByRep[0]?.calls || 0} total.
                </p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 border border-yellow-100 dark:border-yellow-900">
                <h3 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">Success Correlation</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Team members with higher success rates generally have better customer sentiment scores.
                </p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border border-red-100 dark:border-red-900">
                <h3 className="font-medium text-red-700 dark:text-red-400 mb-2">Improvement Needed</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {performanceData.sort((a, b) => a.successRate - b.successRate)[0]?.name || "N/A"} has the lowest success 
                  rate at {performanceData.sort((a, b) => a.successRate - b.successRate)[0]?.successRate || 0}%.
                </p>
              </div>
              
              <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-lg p-4 border border-cyan-100 dark:border-cyan-900">
                <h3 className="font-medium text-cyan-700 dark:text-cyan-400 mb-2">Team Average</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Average success rate is {Math.round(performanceData.reduce((sum, p) => sum + p.successRate, 0) / performanceData.length)}% 
                  with {Math.round(performanceData.reduce((sum, p) => sum + p.sentiment, 0) / performanceData.length)}% sentiment.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPerformanceAnalytics;
