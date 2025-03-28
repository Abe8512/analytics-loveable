
/**
 * Demo Data Service
 * 
 * Central repository for all demo/mock data used throughout the application.
 * This ensures consistency in demo data across all components and services.
 */

import { 
  MetricsData, 
  initialMetricsData, 
  CallOutcome, 
  CallMetric, 
  CallQualityMetric, 
  TopKeyword,
  TeamMetricsData,
  RepMetricsData
} from '@/types/metrics';
import { addDays, subDays, format } from 'date-fns';

/**
 * Generate demo metrics data with realistic values
 * @returns Complete metrics data object with demo values
 */
export const generateDemoMetricsData = (): MetricsData => {
  const demoData: MetricsData = {
    ...initialMetricsData,
    totalCalls: 127,
    avgDuration: 415, // in seconds
    positiveSentiment: 62,
    negativeSentiment: 13,
    neutralSentiment: 25,
    avgSentiment: 0.68,
    callScore: 78,
    conversionRate: 23,
    agentTalkRatio: 56,
    customerTalkRatio: 44,
    topKeywords: ['pricing', 'features', 'competitors', 'timeline', 'support'],
    lastUpdated: new Date(),
    reportDate: new Date().toISOString().split('T')[0],
    isLoading: false,
    isUsingDemoData: true,
    lastError: null
  };
  
  return demoData;
};

/**
 * Generate demo team metrics data
 * @returns Team-level metrics data
 */
export const generateDemoTeamMetricsData = (): TeamMetricsData => {
  return {
    performanceScore: 82,
    totalCalls: 487,
    conversionRate: 0.24,
    avgSentiment: 0.71,
    topKeywords: ['pricing', 'features', 'integration', 'support', 'timeline'],
    avgTalkRatio: {
      agent: 58,
      customer: 42
    }
  };
};

/**
 * Generate demo rep metrics data for a list of team members
 * @param count Number of rep metrics to generate
 * @returns Array of representative performance metrics
 */
export const generateDemoRepMetricsData = (count: number = 5): RepMetricsData[] => {
  const names = [
    'John Smith', 
    'Sarah Johnson', 
    'Michael Chen', 
    'Emily Davis',
    'David Wilson',
    'Jessica Brown',
    'Robert Miller',
    'Amanda Garcia'
  ];
  
  return Array.from({ length: Math.min(count, names.length) }, (_, i) => ({
    id: (i + 1).toString(),
    name: names[i],
    callVolume: Math.floor(Math.random() * 100) + 30,
    successRate: Math.floor(Math.random() * 40) + 20,
    sentiment: (Math.random() * 0.5) + 0.4,
    insights: [
      'Strongest in product knowledge demos',
      'Should focus on objection handling',
      'Good rapport building with clients'
    ]
  }));
};

/**
 * Generate demo call outcome statistics
 * @returns Array of call outcome statistics
 */
export const generateDemoCallOutcomes = (): CallOutcome[] => {
  return [
    { outcome: 'Closed Won', count: 37, percentage: 29 },
    { outcome: 'Next Steps', count: 45, percentage: 35 },
    { outcome: 'Qualified', count: 22, percentage: 17 },
    { outcome: 'No Interest', count: 24, percentage: 19 }
  ];
};

/**
 * Generate demo call metrics with trend indicators
 * @returns Array of call metrics with trend information
 */
export const generateDemoCallMetrics = (): CallMetric[] => {
  return [
    { name: 'Avg Call Duration', value: 6.9, change: 5, status: 'increase' },
    { name: 'Talk Ratio', value: 56, change: 2, status: 'increase' },
    { name: 'Engagement Score', value: 78, change: 8, status: 'increase' },
    { name: 'Objection Rate', value: 2.3, change: 12, status: 'decrease' }
  ];
};

/**
 * Generate demo call quality metrics
 * @returns Array of call quality metrics
 */
export const generateDemoCallQualityMetrics = (): CallQualityMetric[] => {
  return [
    { name: 'Discovery Questions', score: 8, maxScore: 10, category: 'good' },
    { name: 'Value Articulation', score: 7, maxScore: 10, category: 'good' },
    { name: 'Objection Handling', score: 5, maxScore: 10, category: 'average' },
    { name: 'Closing Techniques', score: 9, maxScore: 10, category: 'excellent' }
  ];
};

/**
 * Generate demo trending keywords with sentiment analysis
 * @returns Array of trending keywords with metadata
 */
export const generateDemoTrendingKeywords = (): TopKeyword[] => {
  return [
    { keyword: 'pricing', count: 58, trend: 'up', category: 'sales' },
    { keyword: 'features', count: 42, trend: 'up', category: 'product' },
    { keyword: 'competition', count: 36, trend: 'down', category: 'market' },
    { keyword: 'timeline', count: 29, trend: 'stable', category: 'implementation' },
    { keyword: 'support', count: 25, trend: 'up', category: 'customer success' }
  ];
};

/**
 * Generate demo sales insights with detailed analysis points
 * @returns Array of sales insights
 */
export const generateDemoSalesInsights = (): any[] => {
  return [
    {
      title: 'Increased Discovery Questions',
      description: 'Reps who ask 5+ discovery questions have 40% higher close rates',
      trend: 'up',
      value: '+40%',
      category: 'discovery'
    },
    {
      title: 'Pricing Objections Rising',
      description: 'Pricing mentioned as primary objection in 32% of lost deals',
      trend: 'down',
      value: '32%',
      category: 'objections'
    },
    {
      title: 'Competitor Mentions',
      description: 'CompetitorX mentioned in 28% of calls, up from 18% last quarter',
      trend: 'down',
      value: '+10%',
      category: 'competition'
    },
    {
      title: 'Product Demo Effectiveness',
      description: 'Calls with demos are 35% more likely to advance to next stage',
      trend: 'up',
      value: '35%',
      category: 'demos'
    },
  ];
};

/**
 * Generate demo coaching insights for team development
 * @returns Array of coaching insights
 */
export const generateDemoCoachingInsights = (): any[] => {
  return [
    {
      title: 'Objection Handling',
      description: 'Reps struggle most with pricing and timeline objections',
      recommendation: 'Run a training workshop on pricing discussions',
      impact: 'high'
    },
    {
      title: 'Talk Ratio Imbalance',
      description: 'Reps are speaking 68% of the time in discovery calls',
      recommendation: 'Coach on asking more open-ended questions',
      impact: 'medium'
    },
    {
      title: 'Value Articulation',
      description: 'Only 46% of calls explicitly connect features to customer needs',
      recommendation: 'Develop a value articulation framework for each persona',
      impact: 'high'
    },
  ];
};

/**
 * Generate demo sales opportunity insights
 * @returns Array of sales opportunity insights
 */
export const generateDemoOpportunityInsights = (): any[] => {
  return [
    {
      title: 'Enterprise Segment Growth',
      description: 'Enterprise deals have 38% higher ASP than mid-market',
      action: 'Allocate more SDR resources to enterprise prospecting',
      impact: 'high'
    },
    {
      title: 'Multi-year Contract Conversion',
      description: 'Multi-year mentions convert 25% better than single-year discussions',
      action: 'Update talk tracks to include multi-year options earlier',
      impact: 'medium'
    },
    {
      title: 'Product Integration Questions',
      description: 'Integration questions appear in 42% of advanced-stage calls',
      action: 'Create integration-focused demo assets for sales team',
      impact: 'high'
    },
  ];
};

/**
 * Generate historically consistent demo data for the specified date range
 * @param startDate Start date for the range
 * @param endDate End date for the range
 * @returns Array of date-based metric entries
 */
export const generateHistoricalDemoData = (startDate: Date, endDate: Date): any[] => {
  const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const result = [];
  
  const baseMetrics = {
    calls: 12,
    conversionRate: 22,
    sentiment: 68,
    duration: 415
  };
  
  // Generate daily metrics with realistic variations
  for (let i = 0; i <= dayCount; i++) {
    const currentDate = addDays(startDate, i);
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    
    // Create variations based on day of week (weekends lower)
    const dayFactor = currentDate.getDay() === 0 || currentDate.getDay() === 6 ? 0.4 : 1;
    
    // Add small random variations to create realistic data
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    result.push({
      date: formattedDate,
      calls: Math.round(baseMetrics.calls * dayFactor * randomFactor),
      conversionRate: baseMetrics.conversionRate * dayFactor * randomFactor,
      sentiment: baseMetrics.sentiment * (0.9 + Math.random() * 0.2),
      duration: Math.round(baseMetrics.duration * (0.9 + Math.random() * 0.2))
    });
  }
  
  return result;
};
