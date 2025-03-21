
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, Target, CalendarDays, DollarSign } from "lucide-react";
import ContentLoader from '../ui/ContentLoader';
import AnimatedNumber from '../ui/AnimatedNumber';

// Mock data - in a real app this would come from your API
const forecastTrendData = [
  { month: 'Jan', forecast: 450000, actual: 425000 },
  { month: 'Feb', forecast: 475000, actual: 460000 },
  { month: 'Mar', forecast: 510000, actual: 520000 },
  { month: 'Apr', forecast: 530000, actual: 515000 },
  { month: 'May', forecast: 550000, actual: 545000 },
  { month: 'Jun', forecast: 580000, actual: null },
  { month: 'Jul', forecast: 600000, actual: null },
  { month: 'Aug', forecast: 620000, actual: null }
];

const quarterlyGoalsData = [
  { quarter: 'Q1', goal: 1450000, achieved: 1405000, percentage: 97 },
  { quarter: 'Q2', goal: 1650000, achieved: 1525000, percentage: 92 },
  { quarter: 'Q3', goal: 1850000, achieved: null, percentage: null },
  { quarter: 'Q4', goal: 2100000, achieved: null, percentage: null }
];

interface SalesForecastProps {
  isLoading?: boolean;
}

const SalesForecast = ({ isLoading = false }: SalesForecastProps) => {
  const forecastAccuracy = 94; // Example: 94% forecast accuracy
  const currentMonth = 'May'; // Example current month
  const yearToDateForecast = 2465000; // Example YTD forecast
  const yearToDateActual = 2345000; // Example YTD actual
  const yearToDatePercentage = Math.round((yearToDateActual / yearToDateForecast) * 100);
  
  const customForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const forecastValue = payload.find(p => p.dataKey === 'forecast')?.value;
      const actualValue = payload.find(p => p.dataKey === 'actual')?.value;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-lg font-medium">{label}</p>
          <p className="text-blue-500">
            Forecast: ${forecastValue?.toLocaleString()}
          </p>
          {actualValue !== null && (
            <p className="text-green-500">
              Actual: ${actualValue?.toLocaleString()}
            </p>
          )}
          {actualValue !== null && (
            <p className={actualValue >= forecastValue ? "text-green-500" : "text-red-500"}>
              {actualValue >= forecastValue ? "On Target" : "Below Target"}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
          Sales Forecast
        </CardTitle>
        <CardDescription>
          Revenue projections and goal tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContentLoader isLoading={isLoading} height={500} delay={500}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">YTD Forecast</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={yearToDateForecast} 
                        prefix="$" 
                        formatter={(val) => val.toLocaleString()}
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
                    <p className="text-sm font-medium text-muted-foreground">YTD Actual</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={yearToDateActual} 
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
                    <p className="text-sm font-medium text-muted-foreground">Forecast Accuracy</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={forecastAccuracy} suffix="%" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <CalendarDays className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Revenue Forecast vs Actual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${value/1000}k`}
                  label={{ 
                    value: 'Revenue ($)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <Tooltip content={customForecastTooltip} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#8884d8" 
                  fillOpacity={0.3}
                  fill="#8884d8" 
                  name="Forecast"
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#82ca9d" 
                  fillOpacity={0.3}
                  fill="#82ca9d" 
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Quarterly Goals</h3>
            <div className="space-y-4">
              {quarterlyGoalsData.map((quarter, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{quarter.quarter}</span>
                    <span>
                      Goal: <span className="font-medium">${quarter.goal.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        quarter.percentage === null ? 'bg-gray-400' :
                        quarter.percentage >= 100 ? 'bg-green-500' :
                        quarter.percentage >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${quarter.percentage || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    {quarter.achieved !== null ? (
                      <span>Achieved: ${quarter.achieved.toLocaleString()}</span>
                    ) : (
                      <span>In Progress</span>
                    )}
                    {quarter.percentage !== null ? (
                      <span>{quarter.percentage}%</span>
                    ) : (
                      <span>--</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentLoader>
      </CardContent>
    </Card>
  );
};

export default memo(SalesForecast);
