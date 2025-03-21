
import React, { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlowingCard from "../ui/GlowingCard";
import AnimatedNumber from "../ui/AnimatedNumber";
import { useRealTimeTeamMetrics } from "@/services/RealTimeMetricsService";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateMockChartData, generateMockKPIData, USE_MOCK_DATA } from "@/services/MockDataService";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  gradient?: "blue" | "purple" | "pink" | "green";
  suffix?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
}

const MetricCard = ({ title, value, change, gradient = "blue", suffix = "", children, onClick, isLoading = false }: MetricCardProps) => {
  const displayValue = value !== undefined ? value : 0;
  
  return (
    <GlowingCard 
      gradient={gradient} 
      className="h-full transition-all duration-300 hover:scale-[1.02] cursor-pointer backdrop-blur-sm" 
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          {!isLoading && (
            <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? "bg-neon-green/20 text-neon-green" : "bg-neon-red/20 text-neon-red"}`}>
              {change >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        
        <div className="mb-3">
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <AnimatedNumber 
              value={displayValue} 
              className="text-2xl font-bold text-white"
              suffix={suffix}
            />
          )}
        </div>
        
        <div className="mt-auto">
          {isLoading ? (
            <Skeleton className="w-full h-20" />
          ) : children}
        </div>
      </div>
    </GlowingCard>
  );
};

const PerformanceMetrics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Try to use filters, but handle the case when they're not available
  let filters = {};
  try {
    const { filters: contextFilters } = useSharedFilters();
    filters = contextFilters || {};
  } catch (error) {
    console.warn('SharedFilters not available, using default empty filters');
  }
  
  const [metrics, isLoading] = useRealTimeTeamMetrics(filters);
  
  const mockData = useMemo(() => generateMockKPIData(), []);
  const chartData = useMemo(() => generateMockChartData(), []);
  
  const displayData = useMemo(() => {
    if (USE_MOCK_DATA) {
      return {
        performanceScore: mockData.performanceScore,
        totalCalls: mockData.totalCalls, 
        conversionRate: mockData.conversionRate,
        performanceChange: mockData.performanceChange,
        callsChange: mockData.callsChange,
        conversionChange: mockData.conversionChange,
        performanceData: chartData.performanceData,
        callVolumeData: chartData.callVolumeData,
        conversionData: chartData.conversionData
      };
    } else {
      return {
        performanceScore: metrics?.performanceScore ?? 75,
        totalCalls: metrics?.totalCalls ?? 42,
        conversionRate: metrics?.conversionRate ?? 28,
        performanceChange: 7,
        callsChange: 5,
        conversionChange: 12,
        performanceData: chartData.performanceData,
        callVolumeData: chartData.callVolumeData,
        conversionData: chartData.conversionData
      };
    }
  }, [metrics, mockData, chartData]);

  const navigateToCallActivity = () => {
    navigate("/call-activity");
    toast({
      title: "Navigating to Call Activity",
      description: "View detailed metrics and analysis"
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-purple p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-neon-purple">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <MetricCard 
        title="Performance Score" 
        value={displayData.performanceScore}
        change={displayData.performanceChange}
        gradient="blue"
        onClick={navigateToCallActivity}
        isLoading={isLoading && !USE_MOCK_DATA}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Last 7 days</span>
          <LineChartIcon size={14} className="text-neon-blue" />
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={displayData.performanceData}>
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#00F0FF" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#00F0FF" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </MetricCard>
      
      <MetricCard 
        title="Total Calls" 
        value={displayData.totalCalls}
        change={displayData.callsChange}
        gradient="purple"
        onClick={navigateToCallActivity}
        isLoading={isLoading && !USE_MOCK_DATA}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Last 7 days</span>
          <BarChart3 size={14} className="text-neon-purple" />
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={displayData.callVolumeData}>
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="calls" 
              fill="#8B5CF6" 
              radius={[2, 2, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </MetricCard>
      
      <MetricCard 
        title="Conversion Rate" 
        value={displayData.conversionRate}
        change={displayData.conversionChange}
        gradient="green"
        suffix="%"
        onClick={navigateToCallActivity}
        isLoading={isLoading && !USE_MOCK_DATA}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Last 7 days</span>
          <AreaChartIcon size={14} className="text-neon-green" />
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={displayData.conversionData}>
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06D6A0" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="#06D6A0" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRate)" 
              activeDot={{ r: 4, strokeWidth: 0, fill: "#06D6A0" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </MetricCard>
    </div>
  );
};

export default React.memo(PerformanceMetrics);
