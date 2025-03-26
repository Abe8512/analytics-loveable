import { faker } from '@faker-js/faker';
import { CallTranscript } from './CallTranscriptService';

// Function to generate a single mock call transcript
export function generateMockCallTranscript(): CallTranscript {
  const startTime = faker.date.past();
  const endTime = faker.date.future();
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // Duration in seconds

  // Change any string sentiment to valid "positive" | "neutral" | "negative" type
  const getValidSentiment = (sentiment: string): "positive" | "neutral" | "negative" => {
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment === 'positive') return 'positive';
    if (lowerSentiment === 'negative') return 'negative';
    return 'neutral';
  };

  return {
    id: faker.string.uuid(),
    call_id: faker.string.uuid(),
    text: faker.lorem.paragraph(),
    created_at: faker.date.recent().toISOString(),
    customer_name: faker.person.fullName(),
    duration: duration,
    end_time: endTime.toISOString(),
    sentiment: getValidSentiment(faker.helpers.arrayElement(['positive', 'neutral', 'negative'])),
    speaker_count: faker.number.int({ min: 1, max: 4 }),
    start_time: startTime.toISOString(),
    assigned_to: faker.string.uuid(),
    call_score: faker.number.int({ min: 1, max: 100 }),
    keywords: faker.helpers.arrayElements([
      'sales', 'marketing', 'customer', 'product', 'service'
    ]),
    filename: faker.system.fileName(),
    user_name: faker.person.fullName(),
    metadata: {
      device: faker.helpers.arrayElement(['mobile', 'desktop', 'tablet']),
      location: faker.location.country()
    }
  };
}

// Function to generate multiple mock call transcripts
export function generateMockCallTranscripts(count: number): CallTranscript[] {
  const transcripts: CallTranscript[] = [];
  for (let i = 0; i < count; i++) {
    transcripts.push(generateMockCallTranscript());
  }
  return transcripts;
}
