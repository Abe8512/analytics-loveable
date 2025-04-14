
// This service has been deprecated and should not be used.
// Real data fetching is now handled by the proper services.

// Set USE_MOCK_DATA to false to prevent any accidental mock data generation
export const USE_MOCK_DATA = false;

// Generate mock KPI data for the dashboard - Only used if USE_MOCK_DATA is true
export const generateMockKPIData = () => {
  console.warn('Mock data requested but this function is deprecated. Use real data instead.');
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

// Generate mock chart data - Only used if USE_MOCK_DATA is true
export const generateMockChartData = () => {
  console.warn('Mock chart data requested but this function is deprecated. Use real data instead.');
  return {
    objectionHandlingData: [],
    questionFrequencyData: [],
    keywordOccurrenceData: [],
    talkRatioData: [],
    silenceDistributionData: []
  };
};

// Generate team performance metrics for reports - Only used if USE_MOCK_DATA is true
export const generateMockTeamMetrics = () => {
  console.warn('Mock team metrics requested but this function is deprecated. Use real data instead.');
  return [];
};

// Generate mock sales funnel data - Only used if USE_MOCK_DATA is true
export const generateMockSalesFunnelData = () => {
  console.warn('Mock sales funnel data requested but this function is deprecated. Use real data instead.');
  return [];
};

// Generate random chart data for components - Only used if USE_MOCK_DATA is true
export function generateRandomChartData() {
  console.warn('Random chart data requested but this function is deprecated. Use real data instead.');
  return [];
}
