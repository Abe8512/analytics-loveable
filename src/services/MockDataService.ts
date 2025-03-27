
import { faker } from '@faker-js/faker';
import { TeamPerformanceMetric } from '@/types/team';

// Flag to disable mock data - Setting to false to use only real data
export const USE_MOCK_DATA = false;

// Generate mock KPI data for the dashboard - Only used if USE_MOCK_DATA is true
export const generateMockKPIData = () => {
  if (!USE_MOCK_DATA) {
    console.log('Mock KPI data requested but USE_MOCK_DATA is false');
    return {
      objectionHandlingScore: 0,
      discoveryQuestionsRate: 0,
      closingTechniquesScore: 0,
      clientEngagementScore: 0,
      followUpCommitmentRate: 0,
      painPointIdentificationScore: 0,
      silencePercentage: 0,
    };
  }
  
  // Mock implementation code kept here but won't be used
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

// All other mock data functions follow the same pattern - returning empty data when USE_MOCK_DATA is false
export const generateMockChartData = () => {
  if (!USE_MOCK_DATA) {
    console.log('Mock chart data requested but USE_MOCK_DATA is false');
    return {
      objectionHandlingData: [],
      questionFrequencyData: [],
      keywordOccurrenceData: [],
      talkRatioData: [],
      silenceDistributionData: []
    };
  }
  
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
  if (!USE_MOCK_DATA) {
    console.log('Mock team metrics requested but USE_MOCK_DATA is false');
    return [];
  }
  
  return [];
};

// Generate mock sales funnel data - Only used if USE_MOCK_DATA is true
export const generateMockSalesFunnelData = () => {
  if (!USE_MOCK_DATA) {
    console.log('Mock sales funnel data requested but USE_MOCK_DATA is false');
    return [];
  }
  
  return [];
};

// Generate random chart data for components - Only used if USE_MOCK_DATA is true
export function generateRandomChartData(points = 0) {
  if (!USE_MOCK_DATA) {
    console.log('Random chart data requested but USE_MOCK_DATA is false');
    return [];
  }
  
  return [];
}
