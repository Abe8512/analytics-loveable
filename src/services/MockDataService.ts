
// Generate mock data for the application when real data is not available
import { faker } from '@faker-js/faker';

// Define KPI data structure
export interface KPIData {
  objectionHandlingScore: number;
  discoveryQuestionsRate: number;
  closingTechniquesScore: number;
  clientEngagementScore: number;
  painPointIdentificationScore: number;
  followUpCommitmentRate: number;
  silencePercentage: number;
  newCalls: number;
  totalDuration: number;
  averageScore: number;
  positiveRate: number;
}

// Define chart data structures
export interface ChartData {
  objectionHandlingData: Array<{name: string; score: number}>;
  questionFrequencyData: Array<{name: string; value: number}>;
  keywordOccurrenceData: Array<{subject: string; A: number}>;
  talkRatioData: Array<{name: string; agent: number; customer: number}>;
  silenceDistributionData: Array<{name: string; value: number}>;
  name: string;
  calls: number;
  score: number;
}

// Flag to control whether to use mock data
export const USE_MOCK_DATA = true;

// Generate mock KPI data
export const generateMockKPIData = (): KPIData => {
  return {
    objectionHandlingScore: faker.number.int({ min: 60, max: 95 }),
    discoveryQuestionsRate: faker.number.int({ min: 8, max: 22 }),
    closingTechniquesScore: faker.number.int({ min: 55, max: 90 }),
    clientEngagementScore: faker.number.int({ min: 65, max: 95 }),
    painPointIdentificationScore: faker.number.int({ min: 60, max: 90 }),
    followUpCommitmentRate: faker.number.int({ min: 55, max: 85 }),
    silencePercentage: faker.number.int({ min: 5, max: 25 }),
    newCalls: faker.number.int({ min: 15, max: 45 }),
    totalDuration: faker.number.int({ min: 2400, max: 7200 }),
    averageScore: faker.number.int({ min: 65, max: 92 }),
    positiveRate: faker.number.int({ min: 55, max: 85 })
  };
};

// Generate mock chart data
export const generateMockChartData = (): ChartData[] => {
  const result = Array(5).fill(null).map((_, i) => ({
    name: `Day ${i + 1}`,
    calls: faker.number.int({ min: 5, max: 20 }),
    score: faker.number.int({ min: 60, max: 95 })
  }));
  
  // Add specific chart data properties
  const firstItem = result[0] as any;
  
  // Objection handling data - last 7 days
  firstItem.objectionHandlingData = Array(7).fill(null).map((_, i) => ({
    name: `Day ${i + 1}`,
    score: faker.number.int({ min: 60, max: 95 })
  }));
  
  // Question frequency by type
  firstItem.questionFrequencyData = [
    { name: 'Discovery', value: faker.number.int({ min: 25, max: 40 }) },
    { name: 'Qualification', value: faker.number.int({ min: 15, max: 30 }) },
    { name: 'Pain Point', value: faker.number.int({ min: 10, max: 25 }) },
    { name: 'Closing', value: faker.number.int({ min: 5, max: 20 }) }
  ];
  
  // Keyword occurrence in calls
  firstItem.keywordOccurrenceData = [
    { subject: 'Price', A: faker.number.int({ min: 5, max: 10 }) },
    { subject: 'Feature', A: faker.number.int({ min: 6, max: 12 }) },
    { subject: 'Support', A: faker.number.int({ min: 4, max: 8 }) },
    { subject: 'Timeline', A: faker.number.int({ min: 3, max: 7 }) },
    { subject: 'Integration', A: faker.number.int({ min: 4, max: 9 }) }
  ];
  
  // Talk ratio data - agent vs customer
  firstItem.talkRatioData = Array(5).fill(null).map((_, i) => {
    const agentValue = faker.number.int({ min: 45, max: 65 });
    return {
      name: `Day ${i + 1}`,
      agent: agentValue,
      customer: 100 - agentValue
    };
  });
  
  // Silence distribution data
  firstItem.silenceDistributionData = [
    { name: '1-3 sec', value: faker.number.int({ min: 30, max: 50 }) },
    { name: '4-6 sec', value: faker.number.int({ min: 20, max: 40 }) },
    { name: '7-10 sec', value: faker.number.int({ min: 10, max: 30 }) },
    { name: '11-15 sec', value: faker.number.int({ min: 5, max: 15 }) },
    { name: '>15 sec', value: faker.number.int({ min: 1, max: 10 }) }
  ];
  
  return result;
};

// Generate mock sales funnel data
export const generateMockSalesFunnelData = () => {
  return [
    { name: 'Leads', value: faker.number.int({ min: 80, max: 120 }) },
    { name: 'Qualified', value: faker.number.int({ min: 50, max: 80 }) },
    { name: 'Proposal', value: faker.number.int({ min: 30, max: 50 }) },
    { name: 'Negotiation', value: faker.number.int({ min: 15, max: 30 }) },
    { name: 'Closed Won', value: faker.number.int({ min: 8, max: 20 }) }
  ];
};

// Generate mock analytics data
export interface AnalyticsData {
  pipelineData: Array<{name: string; value: number}>;
  conversionData: Array<{name: string; rate: number}>;
  revenueData: Array<{name: string; actual: number; target: number}>;
  productMixData: Array<{name: string; value: number}>;
}

export const generateMockAnalyticsData = (): AnalyticsData => {
  return {
    pipelineData: [
      { name: 'Discovery', value: faker.number.int({ min: 30, max: 50 }) },
      { name: 'Qualified', value: faker.number.int({ min: 20, max: 40 }) },
      { name: 'Proposal', value: faker.number.int({ min: 15, max: 30 }) },
      { name: 'Negotiation', value: faker.number.int({ min: 10, max: 20 }) },
      { name: 'Closing', value: faker.number.int({ min: 5, max: 15 }) }
    ],
    conversionData: Array(6).fill(null).map((_, i) => ({
      name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      rate: faker.number.int({ min: 20, max: 40 })
    })),
    revenueData: Array(6).fill(null).map((_, i) => {
      const targetValue = faker.number.int({ min: 50000, max: 100000 });
      return {
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
        target: targetValue,
        actual: faker.number.int({ min: targetValue * 0.8, max: targetValue * 1.2 })
      };
    }),
    productMixData: [
      { name: 'Product A', value: faker.number.int({ min: 20, max: 35 }) },
      { name: 'Product B', value: faker.number.int({ min: 15, max: 30 }) },
      { name: 'Product C', value: faker.number.int({ min: 10, max: 25 }) },
      { name: 'Product D', value: faker.number.int({ min: 8, max: 20 }) },
      { name: 'Product E', value: faker.number.int({ min: 5, max: 15 }) }
    ]
  };
};
