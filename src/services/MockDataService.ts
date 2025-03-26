import { v4 as uuidv4 } from 'uuid';
import type { TeamMetricsData, RepMetricsData } from './SharedDataService';

// Flag to control whether mock data should be used
export const USE_MOCK_DATA = true;

// Generate mock data for team metrics
export const generateMockTeamMetrics = (): TeamMetricsData => {
  return {
    totalCalls: Math.floor(Math.random() * 200) + 80,
    avgSentiment: +(Math.random() * 0.4 + 0.5).toFixed(2),
    avgTalkRatio: {
      agent: Math.floor(Math.random() * 15) + 45,
      customer: Math.floor(Math.random() * 15) + 40,
    },
    topKeywords: [
      'pricing',
      'features',
      'support',
      'integration',
      'implementation',
      'timeline',
      'competition',
      'discount',
    ].sort(() => Math.random() - 0.5).slice(0, 5),
    performanceScore: Math.floor(Math.random() * 20) + 65,
    conversionRate: Math.floor(Math.random() * 25) + 35,
  };
};

// List of possible insights for generating rep data
const POSSIBLE_INSIGHTS = [
  'Excellent rapport building',
  'Good at overcoming objections',
  'Strong product knowledge',
  'Could improve closing',
  'Great at discovery questions',
  'Needs work on follow-up',
  'Effective at handling price objections',
  'Should focus more on benefits vs. features',
  'Good call control',
  'Needs improvement in time management',
  'Strong active listening skills',
  'Could ask more targeted questions',
];

// Generate mock data for rep metrics
export const generateMockRepMetrics = (count: number = 5): RepMetricsData[] => {
  // Fixed rep names to ensure consistency
  const repNames = [
    'Alex Johnson',
    'Maria Garcia',
    'David Kim',
    'Sarah Williams',
    'James Taylor',
    'Emily Chen',
    'Robert Martinez',
    'Lisa Brown',
    'Michael Singh',
    'Jennifer Lopez',
  ];

  return Array.from({ length: Math.min(count, repNames.length) }, (_, i) => {
    // Pick 2-3 random insights
    const insights = [...POSSIBLE_INSIGHTS]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 2);

    return {
      id: uuidv4(),
      name: repNames[i],
      callVolume: Math.floor(Math.random() * 80) + 80,
      successRate: Math.floor(Math.random() * 25) + 55,
      sentiment: +(Math.random() * 0.3 + 0.6).toFixed(2),
      insights,
    };
  });
};

// Generate mock call transcripts
export const generateMockTranscripts = (count: number = 10) => {
  const customers = [
    'John Smith',
    'Maria Rodriguez',
    'David Chen',
    'Sarah Johnson',
    'Michael Kim',
    'Emily Wilson',
    'Robert Brown',
    'Jennifer Davis',
    'William Taylor',
    'Lisa Martinez',
  ];

  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const sentiment = Math.random();
    let sentimentLabel: 'positive' | 'neutral' | 'negative';
    
    if (sentiment > 0.6) sentimentLabel = 'positive';
    else if (sentiment > 0.3) sentimentLabel = 'neutral';
    else sentimentLabel = 'negative';
    
    return {
      id: uuidv4(),
      text: 'This is a sample transcript text for demonstration purposes.',
      created_at: date.toISOString(),
      user_id: uuidv4(),
      user_name: 'Demo Sales Rep',
      customer_name: customers[Math.floor(Math.random() * customers.length)],
      duration: Math.floor(Math.random() * 1200) + 300, // 5-25 minutes
      call_score: Math.floor(Math.random() * 40) + 60, // 60-100
      sentiment: sentimentLabel,
      keywords: ['pricing', 'features', 'support'].sort(() => Math.random() - 0.5),
      filename: `call_${i + 1}.mp3`,
      transcript_segments: [
        {
          id: '1',
          text: 'Hello, how can I help you today?',
          start: 0,
          end: 3,
          speaker: 'Agent',
        },
        {
          id: '2',
          text: 'Hi, I\'m interested in your product but have some questions about pricing.',
          start: 3.5,
          end: 8,
          speaker: 'Customer',
        },
        {
          id: '3',
          text: 'I\'d be happy to go over our pricing options with you.',
          start: 8.5,
          end: 12,
          speaker: 'Agent',
        },
      ],
      metadata: {
        call_type: 'sales',
        product: 'SaaS Platform',
        stage: Math.random() > 0.5 ? 'discovery' : 'demo',
      },
    };
  });
};

// Generate a daily call metrics series for charting
export const generateDailyCallMetrics = (days: number = 30) => {
  const today = new Date();
  const result = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    result.push({
      date: date.toISOString().split('T')[0],
      calls: Math.floor(Math.random() * 20) + 5,
      avgDuration: Math.floor(Math.random() * 300) + 300,
      avgSentiment: +(Math.random() * 0.4 + 0.5).toFixed(2),
    });
  }
  
  return result;
};

// Generate keyword trends for charting
export const generateKeywordTrends = () => {
  const keywords = [
    'pricing', 
    'features', 
    'support', 
    'implementation', 
    'integration',
    'timeline',
    'competitors',
    'demo',
    'discount',
    'contract'
  ];
  
  return keywords.map(keyword => ({
    keyword,
    count: Math.floor(Math.random() * 50) + 10,
    sentiment: +(Math.random() * 0.6 + 0.3).toFixed(2),
  })).sort((a, b) => b.count - a.count);
};

export function generateMockKPIData() {
  return {
    newCalls: Math.floor(Math.random() * 100) + 50,
    totalDuration: Math.floor(Math.random() * 5000) + 2000,
    averageScore: Math.floor(Math.random() * 30) + 70,
    positiveRate: Math.floor(Math.random() * 30) + 70,
  };
}

export function generateMockChartData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    calls: Math.floor(Math.random() * 50) + 10,
    score: Math.floor(Math.random() * 20) + 80,
  }));
}

export function generateMockSalesFunnelData() {
  return [
    { name: 'Leads', value: Math.floor(Math.random() * 200) + 100 },
    { name: 'Qualified', value: Math.floor(Math.random() * 150) + 50 },
    { name: 'Proposal', value: Math.floor(Math.random() * 100) + 20 },
    { name: 'Negotiation', value: Math.floor(Math.random() * 50) + 10 },
    { name: 'Closed', value: Math.floor(Math.random() * 20) + 5 },
  ];
}
