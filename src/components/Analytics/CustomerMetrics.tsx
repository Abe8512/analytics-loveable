
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Users, DollarSign, Frown, BarChart as BarChartIcon, Heart } from "lucide-react";
import ContentLoader from '../ui/ContentLoader';
import AnimatedNumber from '../ui/AnimatedNumber';

// Mock data - in a real app this would come from your API
const npsTrendData = [
  { month: 'Jan', promoters: 65, passives: 25, detractors: 10 },
  { month: 'Feb', promoters: 62, passives: 28, detractors: 10 },
  { month: 'Mar', promoters: 68, passives: 22, detractors: 10 },
  { month: 'Apr', promoters: 70, passives: 20, detractors: 10 },
  { month: 'May', promoters: 72, passives: 18, detractors: 10 },
  { month: 'Jun', promoters: 75, passives: 15, detractors: 10 }
];

const churnReasonData = [
  { name: 'Price', value: 35 },
  { name: 'Features', value: 25 },
  { name: 'Support', value: 15 },
  { name: 'Competitor', value: 20 },
  { name: 'Other', value: 5 }
];

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#8884D8'];

interface CustomerMetricsProps {
  isLoading?: boolean;
}

const CustomerMetrics = ({ isLoading = false }: CustomerMetricsProps) => {
  const cac = 1250; // Example: $1,250 customer acquisition cost
  const churnRate = 3.8; // Example: 3.8% monthly churn rate
  const clv = 8500; // Example: $8,500 customer lifetime value
  const clvCacRatio = clv / cac; // CLV to CAC ratio
  const npsScore = 65; // Example: NPS score of 65
  
  // Calculate NPS for each month
  const npsData = npsTrendData.map(item => ({
    month: item.month,
    nps: item.promoters - item.detractors
  }));
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-500" />
          Customer Metrics
        </CardTitle>
        <CardDescription>
          Customer acquisition and retention KPIs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContentLoader isLoading={isLoading} height={450} delay={500}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CAC</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={cac} 
                        prefix="$" 
                        formatter={(val) => val.toLocaleString()}
                      />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-red-500/10">
                    <DollarSign className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={churnRate} 
                        suffix="%"
                        formatter={(val) => val.toFixed(1)}
                      />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    <Frown className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CLV</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={clv} 
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
                    <p className="text-sm font-medium text-muted-foreground">CLV:CAC Ratio</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={clvCacRatio} 
                        formatter={(val) => val.toFixed(1) + 'x'}
                      />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <BarChartIcon className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">NPS Score</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={npsScore} />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <Heart className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">NPS Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={npsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    label={{ 
                      value: 'NPS Score', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' } 
                    }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="nps" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="NPS Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Churn Reasons</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={churnReasonData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {churnReasonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ContentLoader>
      </CardContent>
    </Card>
  );
};

export default memo(CustomerMetrics);
