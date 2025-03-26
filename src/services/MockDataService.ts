
import { faker } from '@faker-js/faker';
import { format, subDays } from 'date-fns';
import { TeamPerformanceMetric } from '@/types/team';
import type { KeywordAnalysis } from '@/services/KeywordAnalysisService';
import type { SentimentTrend } from '@/services/SentimentAnalysisService';

export const USE_MOCK_DATA = true;

export interface ChartData {
  name: string;
  value: number;
  calls?: number;
  score?: number;
  objectionHandlingData?: { name: string; value: number }[];
  questionFrequencyData?: { name: string; value: number }[];
  keywordOccurrenceData?: { name: string; value: number }[];
  talkRatioData?: { name: string; value: number }[];
  silenceDistributionData?: { name: string; value: number }[];
}

// Add missing mock data generation functions
export const generateMockKPIData = () => {
  return [
    { name: 'Revenue', value: faker.number.int({ min: 50000, max: 150000 }) },
    { name: 'Conversion Rate', value: faker.number.int({ min: 10, max: 35 }) },
    { name: 'Avg Deal Size', value: faker.number.int({ min: 5000, max: 25000 }) },
    { name: 'Close Rate', value: faker.number.int({ min: 15, max: 40 }) }
  ];
};

export const generateMockSalesFunnelData = () => {
  const leads = faker.number.int({ min: 800, max: 1500 });
  const qualifiedLeads = Math.round(leads * (faker.number.float({ min: 0.6, max: 0.8 })));
  const proposals = Math.round(qualifiedLeads * (faker.number.float({ min: 0.4, max: 0.6 })));
  const negotiations = Math.round(proposals * (faker.number.float({ min: 0.3, max: 0.5 })));
  const closed = Math.round(negotiations * (faker.number.float({ min: 0.2, max: 0.4 })));
  
  return [
    { name: 'Leads', value: leads },
    { name: 'Qualified Leads', value: qualifiedLeads },
    { name: 'Proposals', value: proposals },
    { name: 'Negotiations', value: negotiations },
    { name: 'Closed', value: closed }
  ];
};

export const generateRandomChartData = (count: number = 5): ChartData[] => {
  const data: ChartData[] = [];
  
  const categories = ['Product Features', 'Pricing', 'Integrations', 'Support', 'Timeline'];
  
  for (let i = 0; i < count; i++) {
    data.push({
      name: categories[i % categories.length],
      value: faker.number.int({ min: 10, max: 100 }),
      calls: faker.number.int({ min: 5, max: 50 }),
      score: faker.number.int({ min: 30, max: 95 }),
      objectionHandlingData: [
        { name: 'Price', value: faker.number.int({ min: 1, max: 10 }) },
        { name: 'Features', value: faker.number.int({ min: 1, max: 10 }) },
        { name: 'Competition', value: faker.number.int({ min: 1, max: 10 }) }
      ],
      questionFrequencyData: [
        { name: 'Open-ended', value: faker.number.int({ min: 5, max: 25 }) },
        { name: 'Closed', value: faker.number.int({ min: 5, max: 20 }) },
        { name: 'Follow-up', value: faker.number.int({ min: 2, max: 15 }) }
      ],
      keywordOccurrenceData: [
        { name: 'Solution', value: faker.number.int({ min: 2, max: 12 }) },
        { name: 'Problem', value: faker.number.int({ min: 1, max: 10 }) },
        { name: 'Value', value: faker.number.int({ min: 1, max: 8 }) },
        { name: 'Timeline', value: faker.number.int({ min: 1, max: 6 }) }
      ],
      talkRatioData: [
        { name: 'Agent', value: faker.number.int({ min: 40, max: 70 }) },
        { name: 'Customer', value: faker.number.int({ min: 30, max: 60 }) }
      ],
      silenceDistributionData: [
        { name: '0-5s', value: faker.number.int({ min: 5, max: 20 }) },
        { name: '5-10s', value: faker.number.int({ min: 3, max: 15 }) },
        { name: '10s+', value: faker.number.int({ min: 1, max: 8 }) }
      ]
    });
  }
  
  return data;
};

export const generateMockSentimentTrends = (days: number = 14): SentimentTrend[] => {
  const trends: SentimentTrend[] = [];
  const sentiments: ["positive", "neutral", "negative"] = ["positive", "neutral", "negative"];
  
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i);
    
    // Generate 3-5 sentiment records per day
    const recordsPerDay = faker.number.int({ min: 3, max: 6 });
    
    for (let j = 0; j < recordsPerDay; j++) {
      const sentiment = sentiments[faker.number.int({ min: 0, max: 2 })];
      const confidence = faker.number.float({ min: 0.6, max: 0.95 });
      
      trends.push({
        id: faker.string.uuid(),
        sentiment_label: sentiment,
        confidence: confidence,
        user_id: faker.string.uuid(),
        recorded_at: date.toISOString()
      });
    }
  }
  
  return trends;
};

export const generateMockKeywordAnalysis = (count: number = 20): KeywordAnalysis[] => {
  const keywords: KeywordAnalysis[] = [];
  const commonKeywords = [
    'pricing', 'features', 'integration', 'timeline', 'support',
    'solution', 'contract', 'problem', 'implementation', 'team',
    'budget', 'competition', 'alternatives', 'decision-maker', 'value',
    'roi', 'demo', 'follow-up', 'partnership', 'scalability'
  ];
  
  for (let i = 0; i < count; i++) {
    const keyword = i < commonKeywords.length 
      ? commonKeywords[i] 
      : faker.word.noun();
    
    keywords.push({
      keyword,
      occurrence_count: faker.number.int({ min: 5, max: 50 }),
      avg_sentiment: faker.number.float({ min: 0.1, max: 0.9 }),
      first_occurrence: subDays(new Date(), faker.number.int({ min: 1, max: 30 })).toISOString(),
      last_occurrence: subDays(new Date(), faker.number.int({ min: 0, max: 5 })).toISOString()
    });
  }
  
  // Sort by occurrence count (descending)
  return keywords.sort((a, b) => b.occurrence_count - a.occurrence_count);
};

export const generateMockTeamMetrics = (): TeamPerformanceMetric[] => {
  const teamMembers = [
    { id: '1', name: 'Alex Johnson' },
    { id: '2', name: 'Sam Wilson' },
    { id: '3', name: 'Taylor Smith' },
    { id: '4', name: 'Jordan Lee' },
    { id: '5', name: 'Casey Morgan' }
  ];
  
  return teamMembers.map(member => ({
    rep_id: member.id,
    rep_name: member.name,
    call_volume: faker.number.int({ min: 25, max: 120 }),
    avg_call_duration: faker.number.int({ min: 180, max: 900 }),
    sentiment_score: faker.number.float({ min: 0.3, max: 0.9 }),
    success_rate: faker.number.float({ min: 0.2, max: 0.85 }),
    avg_talk_ratio: faker.number.float({ min: 0.4, max: 0.7 }),
    objection_handling_score: faker.number.int({ min: 50, max: 95 }),
    positive_language_score: faker.number.int({ min: 50, max: 95 }),
    top_keywords: Array.from({ length: 3 }, () => faker.word.noun()),
    last_call_date: subDays(new Date(), faker.number.int({ min: 0, max: 5 })).toISOString()
  }));
};
