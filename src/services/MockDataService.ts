
import { faker } from '@faker-js/faker';
import { TeamPerformanceMetric } from '@/types/team';

// Flag to disable mock data - Setting to false to use only real data
export const USE_MOCK_DATA = false;

// Generate mock KPI data for the dashboard - Only used if USE_MOCK_DATA is true
export const generateMockKPIData = () => {
  console.warn('Mock KPI data requested but USE_MOCK_DATA is false');
  return {
    objectionHandlingScore: 0,
    discoveryQuestionsRate: 0,
    closingTechniquesScore: 0,
    clientEngagementScore: 0,
    followUpCommitmentRate: 0,
    painPointIdentificationScore: 0,
    silencePercentage: 0,
  };
};

// Generate mock chart data for the dashboard - Only used if USE_MOCK_DATA is true
export const generateMockChartData = () => {
  console.warn('Mock chart data requested but USE_MOCK_DATA is false');
  return {
    objectionHandlingData: [],
    questionFrequencyData: [],
    keywordOccurrenceData: [],
    talkRatioData: [],
    silenceDistributionData: []
  };
};

// Generate team performance metrics for reports - Only used if USE_MOCK_DATA is true
export const generateMockTeamMetrics = (count = 0): TeamPerformanceMetric[] => {
  console.warn('Mock team metrics requested but USE_MOCK_DATA is false');
  return [];
};

// Generate mock sales funnel data - Only used if USE_MOCK_DATA is true
export const generateMockSalesFunnelData = () => {
  console.warn('Mock sales funnel data requested but USE_MOCK_DATA is false');
  return [];
};

// Generate random chart data for components - Only used if USE_MOCK_DATA is true
export function generateRandomChartData(points = 0) {
  console.warn('Random chart data requested but USE_MOCK_DATA is false');
  return [];
}
