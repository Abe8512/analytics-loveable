
import { TeamMetrics } from "./RealTimeMetricsService";

// Mock KPI data generation
export const generateMockKPIData = (): {
  performanceScore: number;
  totalCalls: number;
  conversionRate: number;
  callsChange: number;
  performanceChange: number;
  conversionChange: number;
} => {
  return {
    performanceScore: Math.floor(Math.random() * 25) + 65, // 65-90
    totalCalls: Math.floor(Math.random() * 50) + 100, // 100-150
    conversionRate: Math.floor(Math.random() * 20) + 25, // 25-45
    callsChange: Math.floor(Math.random() * 10) + 1, // 1-10
    performanceChange: Math.floor(Math.random() * 15) + 1, // 1-15
    conversionChange: Math.floor(Math.random() * 12) + 2, // 2-14
  };
};

// Mock team metrics data
export const generateMockTeamMetrics = (): TeamMetrics => {
  return {
    totalCalls: Math.floor(Math.random() * 250) + 150, // 150-400
    avgSentiment: Math.random() * 0.3 + 0.6, // 0.6-0.9
    avgTalkRatio: {
      agent: Math.floor(Math.random() * 20) + 45, // 45-65
      customer: Math.floor(Math.random() * 20) + 35, // 35-55
    },
    topKeywords: [
      "pricing",
      "features",
      "implementation",
      "timeline",
      "support",
    ].sort(() => Math.random() - 0.5).slice(0, 3),
    performanceScore: Math.floor(Math.random() * 25) + 60, // 60-85
    conversionRate: Math.floor(Math.random() * 15) + 30, // 30-45
  };
};

// Chart data generation
export const generateMockChartData = () => {
  // Performance data for the line chart
  const performanceData = [
    { name: "Mon", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Tue", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Wed", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Thu", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Fri", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Sat", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Sun", score: Math.floor(Math.random() * 15) + 65 }
  ];
  
  // Call volume data for the bar chart
  const callVolumeData = [
    { name: "Mon", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Tue", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Wed", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Thu", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Fri", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Sat", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Sun", calls: Math.floor(Math.random() * 10) + 5 }
  ];
  
  // Conversion rate data for the area chart
  const conversionData = [
    { name: "Mon", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Tue", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Wed", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Thu", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Fri", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Sat", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Sun", rate: Math.floor(Math.random() * 15) + 20 }
  ];
  
  return {
    performanceData,
    callVolumeData,
    conversionData
  };
};

// Use this flag to control whether to use mock data or real data
export const USE_MOCK_DATA = true;
