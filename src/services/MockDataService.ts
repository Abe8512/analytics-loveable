
// Mock data service for development and testing

// KPI data
export interface KPIData {
  objectionHandlingScore: number;
  discoveryQuestionsRate: number;
  closingTechniquesScore: number; 
  clientEngagementScore: number;
  painPointIdentificationScore: number;
  followUpCommitmentRate: number;
  silencePercentage: number;
}

// Chart data interface
export interface ChartData {
  objectionHandlingData: Array<{name: string; score: number}>;
  questionFrequencyData: Array<{name: string; value: number}>;
  keywordOccurrenceData: Array<{subject: string; A: number}>;
  talkRatioData: Array<{name: string; agent: number; customer: number}>;
  silenceDistributionData: Array<{name: string; value: number}>;
}

// Sales funnel data
export interface SalesFunnelData {
  name: string;
  value: number;
}

// Team metrics data
export interface TeamMemberMetrics {
  id: string;
  name: string;
  callVolume: number;
  successRate: number;
  avgSentiment: number;
}

// Flag to determine whether to use mock data
export const USE_MOCK_DATA = true;

// Generate mock KPI data
export const generateMockKPIData = (): KPIData => {
  return {
    objectionHandlingScore: 78,
    discoveryQuestionsRate: 14.2,
    closingTechniquesScore: 82,
    clientEngagementScore: 76,
    painPointIdentificationScore: 65,
    followUpCommitmentRate: 88,
    silencePercentage: 12
  };
};

// Generate mock chart data
export const generateMockChartData = (): ChartData => {
  return {
    objectionHandlingData: [
      { name: 'Q1', score: 65 },
      { name: 'Q2', score: 72 },
      { name: 'Q3', score: 78 },
      { name: 'Q4', score: 82 }
    ],
    questionFrequencyData: [
      { name: 'Discovery', value: 35 },
      { name: 'Feature', value: 25 },
      { name: 'Objection', value: 20 },
      { name: 'Closing', value: 15 },
      { name: 'Follow-up', value: 5 }
    ],
    keywordOccurrenceData: [
      { subject: 'Price', A: 80 },
      { subject: 'Features', A: 95 },
      { subject: 'Support', A: 68 },
      { subject: 'Competition', A: 74 },
      { subject: 'Timeline', A: 62 }
    ],
    talkRatioData: [
      { name: 'Call 1', agent: 65, customer: 35 },
      { name: 'Call 2', agent: 58, customer: 42 },
      { name: 'Call 3', agent: 52, customer: 48 },
      { name: 'Call 4', agent: 48, customer: 52 }
    ],
    silenceDistributionData: [
      { name: '0-2 sec', value: 35 },
      { name: '2-5 sec', value: 42 },
      { name: '5-10 sec', value: 18 },
      { name: '10+ sec', value: 5 }
    ]
  };
};

// Generate mock sales funnel data
export const generateMockSalesFunnelData = (): SalesFunnelData[] => {
  return [
    { name: 'Leads', value: 100 },
    { name: 'Qualified', value: 65 },
    { name: 'Demo', value: 40 },
    { name: 'Proposal', value: 25 },
    { name: 'Closed', value: 18 }
  ];
};

// Generate mock team metrics data
export const generateMockTeamMetrics = (): TeamMemberMetrics[] => {
  return [
    { id: '1', name: 'Sarah Johnson', callVolume: 127, successRate: 78, avgSentiment: 0.82 },
    { id: '2', name: 'Michael Chen', callVolume: 98, successRate: 65, avgSentiment: 0.75 },
    { id: '3', name: 'Jessica Smith', callVolume: 112, successRate: 72, avgSentiment: 0.68 },
    { id: '4', name: 'David Wilson', callVolume: 85, successRate: 61, avgSentiment: 0.71 }
  ];
};
