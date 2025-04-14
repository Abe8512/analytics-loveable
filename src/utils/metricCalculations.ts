
/**
 * Metric Calculations Utility
 * 
 * This file contains functions for calculating various metrics
 * from call transcripts and other data.
 */

type Transcript = {
  id: string;
  text?: string;
  sentiment?: string;
  duration?: number;
  created_at?: string;
  // Add other properties as needed
};

/**
 * Calculate average sentiment score for a collection of transcripts
 * @param transcripts Array of transcript objects
 * @returns Number between 0-100 representing sentiment score
 */
export const calculateAverageSentiment = (transcripts: Transcript[]): number => {
  if (!transcripts || transcripts.length === 0) return 0;
  
  // Map sentiment strings to numeric values
  const sentimentMap: Record<string, number> = {
    positive: 100,
    neutral: 50,
    negative: 0
  };
  
  // Calculate total
  let total = 0;
  let count = 0;
  
  for (const transcript of transcripts) {
    if (transcript.sentiment && sentimentMap[transcript.sentiment] !== undefined) {
      total += sentimentMap[transcript.sentiment];
      count++;
    }
  }
  
  return count > 0 ? Math.round(total / count) : 0;
};

/**
 * Calculate average call duration from transcripts
 * @param transcripts Array of transcript objects
 * @returns Average duration in seconds
 */
export const calculateAverageDuration = (transcripts: Transcript[]): number => {
  if (!transcripts || transcripts.length === 0) return 0;
  
  let total = 0;
  let count = 0;
  
  for (const transcript of transcripts) {
    if (transcript.duration) {
      total += transcript.duration;
      count++;
    }
  }
  
  return count > 0 ? Math.round(total / count) : 0;
};

/**
 * Calculate keyword frequency in transcripts
 * @param transcripts Array of transcript objects
 * @param keywords Array of keywords to count
 * @returns Object mapping keywords to their frequencies
 */
export const calculateKeywordFrequency = (
  transcripts: Transcript[], 
  keywords: string[]
): Record<string, number> => {
  const result: Record<string, number> = {};
  
  // Initialize results with 0 counts
  keywords.forEach(keyword => {
    result[keyword] = 0;
  });
  
  // Count occurrences
  transcripts.forEach(transcript => {
    const text = transcript.text || '';
    
    keywords.forEach(keyword => {
      // Create a case-insensitive regex for the keyword
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        result[keyword] += matches.length;
      }
    });
  });
  
  return result;
};

/**
 * Calculate talk ratio between participants
 * @param transcript Text of the transcript
 * @param speakerPrefixes Array of speaker identifiers (e.g., ["Agent:", "Customer:"])
 * @returns Object with percentage speaking time for each speaker
 */
export const calculateTalkRatio = (
  transcript: string, 
  speakerPrefixes: string[]
): Record<string, number> => {
  if (!transcript) return {};
  
  const result: Record<string, number> = {};
  
  // Initialize with 0 values
  speakerPrefixes.forEach(prefix => {
    const speakerName = prefix.replace(':', '').trim();
    result[speakerName] = 0;
  });
  
  // Split text into lines
  const lines = transcript.split('\n');
  const wordCounts: Record<string, number> = {};
  let totalWords = 0;
  
  // Count words for each speaker
  for (const line of lines) {
    for (const prefix of speakerPrefixes) {
      if (line.startsWith(prefix)) {
        const speakerName = prefix.replace(':', '').trim();
        const content = line.replace(prefix, '').trim();
        const words = content.split(/\s+/).length;
        
        wordCounts[speakerName] = (wordCounts[speakerName] || 0) + words;
        totalWords += words;
        break;
      }
    }
  }
  
  // Calculate percentages
  if (totalWords > 0) {
    for (const speaker in wordCounts) {
      result[speaker] = Math.round((wordCounts[speaker] / totalWords) * 100);
    }
  }
  
  return result;
};

/**
 * Count and analyze questions in transcript
 * @param transcript Text of the transcript
 * @param speakerPrefix Prefix indicating the speaker (e.g., "Agent:")
 * @returns Count of questions asked by the specified speaker
 */
export const analyzeQuestions = (transcript: string, speakerPrefix: string): number => {
  if (!transcript) return 0;
  
  let questionCount = 0;
  
  // Split by lines
  const lines = transcript.split('\n');
  
  // Find speaker lines and count question marks
  for (const line of lines) {
    if (line.startsWith(speakerPrefix)) {
      const content = line.replace(speakerPrefix, '').trim();
      const questionMarks = (content.match(/\?/g) || []).length;
      questionCount += questionMarks;
    }
  }
  
  return questionCount;
};

/**
 * Analyze silence duration in transcript (if timestamps are available)
 * @param transcript Text with timestamps
 * @returns Total duration of silences > 2 seconds
 */
export const analyzeSilence = (transcript: string): number => {
  if (!transcript) return 0;
  
  // This is a simplified version - actual implementation would depend on
  // how silences are marked in your transcripts
  const silenceMarkers = transcript.match(/\[silence: (\d+)s\]/g) || [];
  let totalSilence = 0;
  
  for (const marker of silenceMarkers) {
    const duration = parseInt(marker.match(/\d+/)?.[0] || '0', 10);
    if (duration > 2) {
      totalSilence += duration;
    }
  }
  
  return totalSilence;
};

/**
 * Extract keywords from transcript based on type
 * @param transcript The transcript text
 * @param keywordType Type of keywords to extract (objections, benefits, etc)
 * @returns Array of extracted keywords
 */
export const extractKeywords = (transcript: string, keywordType: string): string[] => {
  if (!transcript) return [];
  
  // Preset keywords for different types
  const keywordMap: Record<string, string[]> = {
    objections: ['expensive', 'complicated', 'difficult', 'time', 'competitor', 'not interested'],
    benefits: ['save', 'improve', 'increase', 'efficient', 'better', 'advantage'],
    questions: ['how', 'what', 'when', 'where', 'why', 'who', 'can', 'could', 'would', 'will']
  };
  
  const keywordsToCheck = keywordMap[keywordType.toLowerCase()] || [];
  const found: string[] = [];
  
  // Look for each keyword in the transcript
  keywordsToCheck.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(transcript)) {
      found.push(keyword);
    }
  });
  
  return found;
};

/**
 * Calculate objection handling effectiveness
 * @param transcript Transcript text
 * @returns Score from 0-100 representing effectiveness
 */
export const calculateObjectionHandling = (transcript: string): number => {
  if (!transcript) return 0;
  
  // Extract objections
  const objections = extractKeywords(transcript, 'objections');
  
  // Check if objections were addressed with benefits
  const benefits = extractKeywords(transcript, 'benefits');
  
  // Very simplistic scoring - in practice would be more sophisticated
  if (objections.length === 0) return 100; // No objections to handle
  
  const addressedScore = Math.min(100, Math.round((benefits.length / objections.length) * 100));
  return addressedScore;
};

export const calculateCallScore = (transcript: Transcript): number => {
  if (!transcript || !transcript.text) return 0;
  
  const text = transcript.text;
  
  // Components of the score with different weights
  const components = [
    { name: 'sentiment', weight: 0.3, score: getSentimentScore(transcript.sentiment) },
    { name: 'questions', weight: 0.2, score: getQuestionsScore(text) },
    { name: 'objections', weight: 0.2, score: calculateObjectionHandling(text) },
    { name: 'engagement', weight: 0.3, score: getEngagementScore(text) }
  ];
  
  // Calculate weighted average
  let totalScore = 0;
  let totalWeight = 0;
  
  components.forEach(component => {
    totalScore += component.score * component.weight;
    totalWeight += component.weight;
  });
  
  return Math.round(totalScore / totalWeight);
};

// Helper functions for call score calculation
const getSentimentScore = (sentiment?: string): number => {
  if (!sentiment) return 50;
  
  const scores: Record<string, number> = {
    positive: 100,
    neutral: 50,
    negative: 0
  };
  
  const sentimentLower = (sentiment || '').toLowerCase();
  return scores[sentimentLower] !== undefined ? scores[sentimentLower] : 50;
};

const getQuestionsScore = (text: string): number => {
  // Count questions asked by agent
  const agentQuestions = analyzeQuestions(text, 'Agent:');
  
  // Score based on question count (more questions generally better up to a point)
  if (agentQuestions >= 10) return 100;
  if (agentQuestions >= 7) return 85;
  if (agentQuestions >= 5) return 70;
  if (agentQuestions >= 3) return 50;
  if (agentQuestions >= 1) return 30;
  return 0;
};

const getEngagementScore = (text: string): number => {
  // Calculate talk ratio
  const talkRatio = calculateTalkRatio(text, ['Agent:', 'Customer:']);
  
  // Best engagement is when customer talks more than agent
  const agentTalk = talkRatio['Agent'] || 0;
  const customerTalk = talkRatio['Customer'] || 0;
  
  if (customerTalk === 0) return 0;
  
  // Ideal ratio: customer talks 60-70% of the time
  if (customerTalk >= 60 && customerTalk <= 70) return 100;
  if (customerTalk >= 50 && customerTalk < 60) return 85;
  if (customerTalk >= 40 && customerTalk < 50) return 70;
  if (customerTalk >= 30 && customerTalk < 40) return 50;
  if (customerTalk >= 20 && customerTalk < 30) return 30;
  return 20; // Either agent dominated or very little customer engagement
};

export default {
  calculateAverageSentiment,
  calculateAverageDuration,
  calculateKeywordFrequency,
  calculateTalkRatio,
  analyzeQuestions,
  analyzeSilence,
  extractKeywords,
  calculateObjectionHandling,
  calculateCallScore
};
