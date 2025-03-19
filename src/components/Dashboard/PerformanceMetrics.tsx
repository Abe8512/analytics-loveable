
import React from "react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlowingCard from "../ui/GlowingCard";
import AnimatedNumber from "../ui/AnimatedNumber";
import { useSharedTeamMetrics } from "@/services/SharedDataService";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { Skeleton } from "../ui/skeleton";

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
  return (
    <GlowingCard gradient={gradient} className="h-full" onClick={onClick}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          {!isLoading && (
            <div className={`flex items-center text-xs font-medium ${change >= 0 ? "text-neon-green" : "text-neon-red"}`}>
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
              value={value} 
              className="text-2xl font-bold text-white"
              suffix={suffix}
            />
          )}
        </div>
        
        <div className="mt-auto">
          {children}
        </div>
      </div>
    </GlowingCard>
  );
};

const PerformanceMetrics = () => {
  const navigate = useNavigate();
  const { filters } = useSharedFilters();
  
  const { metrics, isLoading: isMetricsLoading } = useSharedTeamMetrics(filters);
  
  // Generate sample data for charts - using fixed values for stability
  const performanceData = [
    { name: "Mon", score: 65 },
    { name: "Tue", score: 68 },
    { name: "Wed", score: 72 },
    { name: "Thu", score: 75 },
    { name: "Fri", score: 82 },
    { name: "Sat", score: 78 },
    { name: "Sun", score: 80 }
  ];
  
  const callVolumeData = [
    { name: "Mon", calls: 5 },
    { name: "Tue", calls: 8 },
    { name: "Wed", calls: 12 },
    { name: "Thu", calls: 7 },
    { name: "Fri", calls: 11 },
    { name: "Sat", calls: 4 },
    { name: "Sun", calls: 6 }
  ];
  
  const conversionData = [
    { name: "Mon", rate: 20 },
    { name: "Tue", rate: 25 },
    { name: "Wed", rate: 30 },
    { name: "Thu", rate: 28 },
    { name: "Fri", rate: 35 },
    { name: "Sat", rate: 32 },
    { name: "Sun", rate: 30 }
  ];
  
  const navigateToCallActivity = () => {
    navigate("/call-activity");
  };

  // Fixed values for change percentages
  const performanceChange = 7;
  const callsChange = 5;
  const conversionChange = 12;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard 
        title="Performance Score" 
        value={metrics.performanceScore || 0} 
        change={performanceChange}
        gradient="blue"
        onClick={navigateToCallActivity}
        isLoading={isMetricsLoading}
      >
        {isMetricsLoading ? (
          <Skeleton className="w-full h-20" />
        ) : (
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={performanceData}>
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#00F0FF" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </MetricCard>
      
      <MetricCard 
        title="Total Calls" 
        value={metrics.totalCalls} 
        change={callsChange}
        gradient="purple"
        onClick={navigateToCallActivity}
        isLoading={isMetricsLoading}
      >
        {isMetricsLoading ? (
          <Skeleton className="w-full h-20" />
        ) : (
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={callVolumeData}>
              <Bar 
                dataKey="calls" 
                fill="#8B5CF6" 
                radius={[2, 2, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </MetricCard>
      
      <MetricCard 
        title="Conversion Rate" 
        value={metrics.conversionRate} 
        change={conversionChange}
        gradient="green"
        suffix="%"
        onClick={navigateToCallActivity}
        isLoading={isMetricsLoading}
      >
        {isMetricsLoading ? (
          <Skeleton className="w-full h-20" />
        ) : (
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={conversionData}>
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
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </MetricCard>
    </div>
  );
};

export default React.memo(PerformanceMetrics);
