
import { faker } from '@faker-js/faker';
import { CallTranscript } from '@/types/call';

// Function to generate a single mock call transcript
export function generateMockCallTranscript(): CallTranscript {
  const startTime = faker.date.past();
  const endTime = new Date(startTime);
  endTime.setSeconds(endTime.getSeconds() + faker.number.int({ min: 120, max: 900 })); // 2-15 minutes
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // Duration in seconds

  // Change any string sentiment to valid "positive" | "neutral" | "negative" type
  const getValidSentiment = (sentiment: string): "positive" | "neutral" | "negative" => {
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment === 'positive') return 'positive';
    if (lowerSentiment === 'negative') return 'negative';
    return 'neutral';
  };

  console.log('Generating mock call transcript (demo data)');
  
  return {
    id: faker.string.uuid(),
    text: faker.lorem.paragraph(5),
    created_at: faker.date.recent().toISOString(),
    customer_name: faker.person.fullName(),
    duration: duration,
    end_time: endTime.toISOString(),
    sentiment: getValidSentiment(faker.helpers.arrayElement(['positive', 'neutral', 'negative'])),
    speaker_count: faker.number.int({ min: 1, max: 3 }),
    start_time: startTime.toISOString(),
    assigned_to: faker.string.uuid(),
    call_score: faker.number.int({ min: 50, max: 95 }),
    keywords: faker.helpers.arrayElements([
      'pricing', 'features', 'product', 'service', 'support', 
      'competitors', 'timeline', 'implementation', 'demo', 'contract'
    ], faker.number.int({ min: 2, max: 5 })),
    filename: `call-recording-${faker.string.alphanumeric(8)}.wav`,
    user_name: faker.person.fullName(),
    metadata: {
      device: faker.helpers.arrayElement(['mobile', 'desktop', 'tablet']),
      location: faker.location.city(),
      call_purpose: faker.helpers.arrayElement(['sales', 'support', 'onboarding', 'consultation']),
      outcome: faker.helpers.arrayElement(['sale', 'follow-up', 'no-sale'])
    }
  };
}

// Function to generate multiple mock call transcripts
export function generateMockCallTranscripts(count: number): CallTranscript[] {
  console.log(`Generating ${count} mock call transcripts (demo data)`);
  const transcripts: CallTranscript[] = [];
  for (let i = 0; i < count; i++) {
    transcripts.push(generateMockCallTranscript());
  }
  return transcripts;
}

export const generateMockTranscript = (id?: string): CallTranscript => {
  const mockId = id || faker.string.uuid();
  
  console.log(`Generating mock transcript with ID: ${mockId} (demo data)`);
  
  return {
    id: mockId,
    text: `This is a demo transcript for call ${mockId.substring(0, 8)}. The customer was inquiring about our premium service options and pricing tiers. The agent provided a detailed explanation of the available plans and offered to send follow-up materials.`,
    duration: faker.number.int({ min: 180, max: 600 }),
    sentiment: faker.helpers.arrayElement(['positive', 'neutral', 'negative']) as 'positive' | 'neutral' | 'negative',
    keywords: ['pricing', 'premium', 'service', 'options'],
    key_phrases: ['pricing options', 'premium service', 'follow-up materials'],
    call_score: faker.number.int({ min: 60, max: 95 }),
    user_name: faker.person.fullName(),
    customer_name: faker.person.fullName(),
    created_at: faker.date.recent().toISOString(),
    filename: `call-recording-${mockId.substring(0, 8)}.wav`,
    metadata: {
      outcome: faker.helpers.arrayElement(['sale', 'follow-up', 'no-sale']),
      product_discussed: faker.helpers.arrayElement(['Enterprise', 'Professional', 'Basic']),
      call_duration_seconds: faker.number.int({ min: 180, max: 600 }),
      demo_data: true
    }
  };
};

// Generate call metrics summary for demo purposes
export function generateDemoCallMetricsSummary(days = 7) {
  console.log(`Generating demo call metrics summary for ${days} days`);
  const metrics = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const reportDate = date.toISOString().split('T')[0];
    
    // Generate slightly random but trending metrics
    const baseCalls = 20 + Math.floor(Math.random() * 10);
    const totalCalls = Math.max(0, baseCalls - i);
    const positiveCalls = Math.floor(totalCalls * (0.6 + (Math.random() * 0.2)));
    const negativeCalls = Math.floor(totalCalls * (0.1 + (Math.random() * 0.1)));
    const neutralCalls = totalCalls - positiveCalls - negativeCalls;
    
    metrics.push({
      id: faker.string.uuid(),
      report_date: reportDate,
      total_calls: totalCalls,
      total_duration: totalCalls * (300 + Math.floor(Math.random() * 120)),
      avg_duration: 300 + Math.floor(Math.random() * 120),
      positive_sentiment_count: positiveCalls,
      neutral_sentiment_count: neutralCalls,
      negative_sentiment_count: negativeCalls,
      avg_sentiment: 0.5 + (Math.random() * 0.3),
      agent_talk_ratio: 40 + Math.floor(Math.random() * 20),
      customer_talk_ratio: 60 - Math.floor(Math.random() * 20),
      performance_score: 70 + Math.floor(Math.random() * 15),
      conversion_rate: 0.25 + (Math.random() * 0.15),
      top_keywords: ['pricing', 'features', 'support', 'competitors', 'timeline'].slice(0, 3 + Math.floor(Math.random() * 3)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return metrics;
}

// Generate rep metrics for demo purposes
export function generateDemoRepMetrics(count = 5) {
  console.log(`Generating demo rep metrics for ${count} reps`);
  const metrics = [];
  
  for (let i = 0; i < count; i++) {
    const repId = faker.string.uuid();
    const repName = faker.person.fullName();
    const callVolume = 10 + Math.floor(Math.random() * 20);
    
    metrics.push({
      id: faker.string.uuid(),
      rep_id: repId,
      rep_name: repName,
      call_volume: callVolume,
      sentiment_score: 0.4 + (Math.random() * 0.4),
      success_rate: 60 + Math.floor(Math.random() * 30),
      top_keywords: ['pricing', 'features', 'support', 'competitors', 'timeline'].slice(0, 3 + Math.floor(Math.random() * 3)),
      insights: [
        faker.helpers.arrayElement([
          'Good at discovery questions',
          'Handles objections well',
          'Needs improvement on closing',
          'Excellent product knowledge',
          'Good follow-up rate',
          'Needs to reduce talk time'
        ]),
        faker.helpers.arrayElement([
          'Could improve feature explanations',
          'Strong on competitive positioning',
          'Consistently follows process',
          'Needs better call preparation',
          'Good at building rapport',
          'Could improve questioning technique'
        ])
      ],
      time_period: 'all_time',
      updated_at: new Date().toISOString()
    });
  }
  
  return metrics;
}
