
import { faker } from '@faker-js/faker';
import { TeamPerformanceMetric } from '@/types/team';

// Flag to disable mock data
export const USE_MOCK_DATA = false;

// Generate mock KPI data for the dashboard
export const generateMockKPIData = () => {
  return {
    objectionHandlingScore: faker.number.int({ min: 65, max: 95 }),
    discoveryQuestionsRate: faker.number.float({ min: 4.5, max: 8.5, fractionDigits: 1 }),
    closingTechniquesScore: faker.number.int({ min: 70, max: 90 }),
    clientEngagementScore: faker.number.int({ min: 75, max: 98 }),
    followUpCommitmentRate: faker.number.int({ min: 60, max: 95 }),
    painPointIdentificationScore: faker.number.int({ min: 65, max: 90 }),
    silencePercentage: faker.number.int({ min: 5, max: 20 }),
  };
};

// Generate mock chart data for the dashboard
export const generateMockChartData = () => {
  console.warn('Using mock chart data - should be disabled in production');
  return {
    objectionHandlingData: Array.from({ length: 10 }, (_, i) => ({
      name: `Day ${i + 1}`,
      score: faker.number.int({ min: 60, max: 95 })
    })),
    questionFrequencyData: [
      { name: 'Discovery', value: 40 },
      { name: 'Objection', value: 25 },
      { name: 'Closing', value: 20 },
      { name: 'Follow-up', value: 15 }
    ],
    keywordOccurrenceData: [
      { subject: 'Price', A: faker.number.int({ min: 50, max: 100 }) },
      { subject: 'Feature', A: faker.number.int({ min: 50, max: 100 }) },
      { subject: 'Support', A: faker.number.int({ min: 50, max: 100 }) },
      { subject: 'Quality', A: faker.number.int({ min: 50, max: 100 }) },
      { subject: 'Timeline', A: faker.number.int({ min: 50, max: 100 }) }
    ],
    talkRatioData: Array.from({ length: 5 }, (_, i) => {
      const agentValue = faker.number.int({ min: 40, max: 70 });
      return {
        name: `Week ${i + 1}`,
        agent: agentValue,
        customer: 100 - agentValue
      };
    }),
    silenceDistributionData: [
      { name: '0-3s', value: faker.number.int({ min: 30, max: 60 }) },
      { name: '3-5s', value: faker.number.int({ min: 20, max: 40 }) },
      { name: '5-10s', value: faker.number.int({ min: 10, max: 30 }) },
      { name: '>10s', value: faker.number.int({ min: 5, max: 15 }) }
    ]
  };
};

// Generate team performance metrics for reports
export const generateMockTeamMetrics = (count = 5): TeamPerformanceMetric[] => {
  console.warn('Using mock team metrics - should be disabled in production');
  const metrics: TeamPerformanceMetric[] = [];
  
  for (let i = 0; i < count; i++) {
    metrics.push({
      rep_id: faker.string.uuid(),
      rep_name: faker.person.fullName(),
      call_volume: faker.number.int({ min: 20, max: 120 }),
      avg_call_duration: faker.number.int({ min: 120, max: 600 }),
      sentiment_score: faker.number.float({ min: 0.4, max: 0.9, fractionDigits: 2 }),
      success_rate: faker.number.float({ min: 0.5, max: 0.95, fractionDigits: 2 }),
      avg_talk_ratio: faker.number.float({ min: 0.4, max: 0.7, fractionDigits: 2 }),
      objection_handling_score: faker.number.float({ min: 0.6, max: 0.95, fractionDigits: 2 }),
      positive_language_score: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
      top_keywords: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => 
        faker.word.sample()),
      last_call_date: faker.date.recent().toISOString()
    });
  }
  
  return metrics;
};

// Generate mock sales funnel data
export const generateMockSalesFunnelData = () => {
  console.warn('Using mock sales funnel data - should be disabled in production');
  return [
    { name: 'Lead', value: faker.number.int({ min: 80, max: 120 }) },
    { name: 'Discovery', value: faker.number.int({ min: 50, max: 80 }) },
    { name: 'Proposal', value: faker.number.int({ min: 30, max: 50 }) },
    { name: 'Negotiation', value: faker.number.int({ min: 15, max: 35 }) },
    { name: 'Closed', value: faker.number.int({ min: 10, max: 25 }) }
  ];
};

// Generate random chart data for components
export function generateRandomChartData(points = 7) {
  console.warn('Using random chart data - should be disabled in production');
  return Array.from({ length: points }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: faker.number.int({ min: 10, max: 100 })
  }));
}
