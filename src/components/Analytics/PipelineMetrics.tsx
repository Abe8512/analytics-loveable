
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, Target, Award, DollarSign } from "lucide-react";
import ContentLoader from '../ui/ContentLoader';
import AnimatedNumber from '../ui/AnimatedNumber';

// Mock data - in a real app this would come from your API
const pipelineData = [
  { name: 'Discovery', value: 45000, count: 15 },
  { name: 'Qualification', value: 75000, count: 22 },
  { name: 'Proposal', value: 120000, count: 18 },
  { name: 'Negotiation', value: 85000, count: 9 },
  { name: 'Closing', value: 60000, count: 6 }
];

const dealVelocityData = [
  { name: 'Small (<$10k)', days: 18 },
  { name: 'Medium ($10k-$50k)', days: 28 },
  { name: 'Large ($50k-$100k)', days: 45 },
  { name: 'Enterprise (>$100k)', days: 65 }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

interface PipelineMetricsProps {
  isLoading?: boolean;
}

const PipelineMetrics = ({ isLoading = false }: PipelineMetricsProps) => {
  const totalPipelineValue = pipelineData.reduce((sum, item) => sum + item.value, 0);
  const quota = 125000; // Example quota
  const pipelineCoverage = totalPipelineValue / quota;
  const winRate = 32; // Example win rate percentage
  const avgDealSize = 38500; // Example average deal size
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-primary">
            Value: ${payload[0].payload.value.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Deals: {payload[0].payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-500" />
          Pipeline Metrics
        </CardTitle>
        <CardDescription>
          Key pipeline performance indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContentLoader isLoading={isLoading} height={450} delay={500}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={totalPipelineValue} 
                        prefix="$" 
                        formatter={(val) => val.toLocaleString()}
                      />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pipeline Coverage</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={pipelineCoverage} 
                        formatter={(val) => val.toFixed(1) + 'x'}
                      />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Target className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={winRate} suffix="%" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <Award className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Deal Size</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={avgDealSize} 
                        prefix="$" 
                        formatter={(val) => val.toLocaleString()}
                      />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    <TrendingUp className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Pipeline by Stage</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `$${value/1000}k`}
                    label={{ 
                      value: 'Value ($)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' } 
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Deal Velocity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dealVelocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{ 
                      value: 'Days', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' } 
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="days" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ContentLoader>
      </CardContent>
    </Card>
  );
};

export default memo(PipelineMetrics);
