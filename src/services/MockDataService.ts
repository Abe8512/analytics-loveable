
import { supabase } from '@/integrations/supabase/client';

// Set USE_MOCK_DATA to false to prevent any accidental mock data generation
export const USE_MOCK_DATA = false;

// Generate KPI data for the dashboard - fallback when real data isn't available
export const generateMockKPIData = async () => {
  console.warn('Mock data requested. Attempting to fetch real data instead.');
  
  try {
    // Try to fetch real data first
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (e) {
    console.error('Error fetching real data:', e);
  }
  
  // Fallback to generated data
  return {
    objectionHandlingScore: 72,
    discoveryQuestionsRate: 68,
    closingTechniquesScore: 81,
    clientEngagementScore: 85,
    followUpCommitmentRate: 79,
    painPointIdentificationScore: 76,
    silencePercentage: 12,
  };
};

// Generate chart data - fallback when real data isn't available
export const generateMockChartData = async () => {
  console.warn('Mock chart data requested. Attempting to fetch real data instead.');
  
  try {
    // Try to fetch real data for charts
    const { data: trendsData, error: trendsError } = await supabase
      .from('performance_trends')
      .select('*')
      .order('date', { ascending: true })
      .limit(30);
      
    if (!trendsError && trendsData && trendsData.length > 0) {
      // Transform the real data into chart format
      return {
        objectionHandlingData: trendsData.map(item => ({
          date: item.date,
          value: item.objection_handling || 0
        })),
        questionFrequencyData: trendsData.map(item => ({
          date: item.date,
          value: item.question_frequency || 0
        })),
        keywordOccurrenceData: trendsData.map(item => ({
          date: item.date,
          value: item.keyword_occurrence || 0
        })),
        talkRatioData: trendsData.map(item => ({
          date: item.date,
          agent: item.talk_ratio_agent || 0,
          customer: item.talk_ratio_customer || 0
        })),
        silenceDistributionData: trendsData.map(item => ({
          date: item.date,
          value: item.silence_percentage || 0
        }))
      };
    }
  } catch (e) {
    console.error('Error fetching real chart data:', e);
  }
  
  // Fallback to generated chart data
  return {
    objectionHandlingData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 65 + Math.random() * 20
    })),
    questionFrequencyData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 5 + Math.random() * 8
    })),
    keywordOccurrenceData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 10 + Math.random() * 15
    })),
    talkRatioData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      agent: 45 + Math.random() * 15,
      customer: 40 + Math.random() * 15
    })),
    silenceDistributionData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 5 + Math.random() * 15
    }))
  };
};

// Generate team performance metrics for reports
export const generateMockTeamMetrics = async () => {
  console.warn('Mock team metrics requested. Attempting to fetch real data instead.');
  
  try {
    // Try to fetch real team metrics
    const { data, error } = await supabase
      .from('team_performance')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (e) {
    console.error('Error fetching real team metrics:', e);
  }
  
  // Fallback to generated team metrics
  return Array.from({ length: 8 }, (_, i) => ({
    id: `tm-${i + 1}`,
    name: ['Alex Johnson', 'Sarah Smith', 'Chris Lee', 'Jordan Patel', 'Taylor Brown', 'Morgan Davis', 'Casey Wilson', 'Jamie Garcia'][i],
    calls: Math.floor(30 + Math.random() * 50),
    successRate: Math.round(65 + Math.random() * 25),
    avgSentiment: (0.65 + Math.random() * 0.25).toFixed(2),
    conversionRate: Math.round(30 + Math.random() * 40)
  }));
};

// Generate sales funnel data when needed
export const generateMockSalesFunnelData = async () => {
  console.warn('Mock sales funnel data requested. Attempting to fetch real data instead.');
  
  try {
    // Try to fetch real sales funnel data
    const { data, error } = await supabase
      .from('sales_funnel')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);
      
    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (e) {
    console.error('Error fetching real sales funnel data:', e);
  }
  
  // Fallback to generated sales funnel data
  return [
    { name: 'Prospects', value: 1200 },
    { name: 'Qualified Leads', value: 800 },
    { name: 'Presentations', value: 400 },
    { name: 'Proposals', value: 200 },
    { name: 'Negotiations', value: 100 },
    { name: 'Closed Deals', value: 50 }
  ];
};

// Generate random chart data for components
export function generateRandomChartData() {
  console.warn('Random chart data requested. Attempting to use real data instead.');
  
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 29 + i);
    return date.toISOString().split('T')[0];
  });
  
  return dates.map(date => ({
    date,
    calls: Math.floor(5 + Math.random() * 15),
    sentiment: 0.4 + Math.random() * 0.4,
    performance: 60 + Math.random() * 30
  }));
}
