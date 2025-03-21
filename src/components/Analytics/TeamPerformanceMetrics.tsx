
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Users, Clock, Target, CheckCircle2, Hourglass } from "lucide-react";
import ContentLoader from '../ui/ContentLoader';
import AnimatedNumber from '../ui/AnimatedNumber';

// Mock data - in a real app this would come from your API
const quotaAttainmentData = [
  { name: 'Jan', attainment: 85 },
  { name: 'Feb', attainment: 78 },
  { name: 'Mar', attainment: 92 },
  { name: 'Apr', attainment: 88 },
  { name: 'May', attainment: 95 },
  { name: 'Jun', attainment: 82 }
];

const salesCycleData = [
  { rep: 'John', days: 32 },
  { rep: 'Sarah', days: 28 },
  { rep: 'Mike', days: 45 },
  { rep: 'Emma', days: 22 },
  { rep: 'David', days: 38 }
];

const leadResponseData = [
  { rep: 'John', minutes: 15 },
  { rep: 'Sarah', minutes: 8 },
  { rep: 'Mike', minutes: 25 },
  { rep: 'Emma', minutes: 5 },
  { rep: 'David', minutes: 12 }
];

interface TeamPerformanceMetricsProps {
  isLoading?: boolean;
}

const TeamPerformanceMetrics = ({ isLoading = false }: TeamPerformanceMetricsProps) => {
  const quotaAttainment = 84; // Example: 84% of team hitting quotas
  const avgRampTime = 45; // Example: 45 days average ramp time
  const avgLeadResponseTime = 12; // Example: 12 minutes average lead response time
  const avgSalesCycle = 32; // Example: 32 days average sales cycle
  const opportunityWinRatio = 28; // Example: 28% opportunity to win ratio
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-cyan-500" />
          Team Performance Metrics
        </CardTitle>
        <CardDescription>
          Sales team efficiency and effectiveness indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContentLoader isLoading={isLoading} height={450} delay={500}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quota Attainment</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={quotaAttainment} suffix="%" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-green-500/10">
                    <Target className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Ramp Time</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={avgRampTime} suffix=" days" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <Hourglass className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lead Response Time</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={avgLeadResponseTime} suffix=" min" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sales Cycle</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={avgSalesCycle} suffix=" days" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-indigo-500/10">
                    <Clock className="h-5 w-5 text-indigo-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Opportunity-Win</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={opportunityWinRatio} suffix="%" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Quota Attainment Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={quotaAttainmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    domain={[50, 100]}
                    label={{ 
                      value: 'Attainment (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' } 
                    }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="attainment" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Quota Attainment (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Lead Response Time by Rep</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={leadResponseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rep" />
                  <YAxis
                    label={{ 
                      value: 'Minutes', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' } 
                    }}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="minutes" 
                    fill="#82ca9d" 
                    name="Response Time (minutes)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ContentLoader>
      </CardContent>
    </Card>
  );
};

export default memo(TeamPerformanceMetrics);
