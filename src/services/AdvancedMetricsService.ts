import { CallTranscript } from '@/types/call';
import { calculateSilence, calculateTalkRatio } from '@/utils/metricCalculations';

/**
 * Processes transcript segments to calculate insights
 * @param transcript The transcript to analyze
 */
export const processTranscriptSegments = (transcript: CallTranscript) => {
  const segments = transcript.transcript_segments;
  
  // Skip if no segments are available
  if (!segments || !Array.isArray(segments) || segments.length === 0) {
    console.log('No segments to process for transcript:', transcript.id);
    return {
      speakerTimeMap: {},
      speakerWordCounts: {},
      totalDuration: transcript.duration || 0,
      silencePercentage: 0,
      agentInterruptions: 0,
      customerInterruptions: 0,
      sentiment: {
        agent: transcript.sentiment || 0.5,
        customer: transcript.sentiment || 0.5
      }
    };
  }
  
  // Initialize data structures
  const speakerTimeMap: { [speaker: string]: number } = {};
  const speakerWordCounts: { [speaker: string]: number } = {};
  let agentInterruptions = 0;
  let customerInterruptions = 0;
  
  // Process each segment
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const speaker = segment.speaker || 'unknown';
    const words = segment.text ? segment.text.split(/\s+/) : [];
    const duration = segment.end - segment.start;
    
    // Update speaker time
    speakerTimeMap[speaker] = (speakerTimeMap[speaker] || 0) + duration;
    
    // Update speaker word count
    speakerWordCounts[speaker] = (speakerWordCounts[speaker] || 0) + words.length;
    
    // Check for interruptions
    if (i > 0) {
      const prevSegment = segments[i - 1];
      
      if (prevSegment.speaker !== speaker) {
        if (speaker === 'agent' && prevSegment.speaker === 'customer') {
          agentInterruptions++;
        } else if (speaker === 'customer' && prevSegment.speaker === 'agent') {
          customerInterruptions++;
        }
      }
    }
  }
  
  // Calculate total duration and silence
  const totalDuration = transcript.duration || 0;
  const silencePercentage = (calculateSilence(segments, totalDuration) / totalDuration) * 100;
  
  // Calculate sentiment scores
  const agentSentiment = transcript.sentiment || 0.5;
  const customerSentiment = transcript.sentiment || 0.5;
  
  return {
    speakerTimeMap,
    speakerWordCounts,
    totalDuration,
    silencePercentage,
    agentInterruptions,
    customerInterruptions,
    sentiment: {
      agent: agentSentiment,
      customer: customerSentiment
    }
  };
};

// Helper to safely check array length
function safeArrayLength(arr: any): number {
  if (!arr) return 0;
  if (Array.isArray(arr)) return arr.length;
  return 0;
}

/**
 * Processes transcript data to extract call insights
 * @param transcript The transcript to analyze
 */
export const processTranscriptInsights = (transcript: CallTranscript) => {
  // Ensure transcript exists
  if (!transcript) {
    return { insights: [], warnings: [], keywords: [] };
  }
  
  // Get the transcript text
  const text = transcript.text || '';
  
  // Process keywords
  const keywords = transcript.keywords ? [...transcript.keywords] : [];
  
  // Check for short transcript
  const wordCount = text.split(/\s+/).length;
  const isShortTranscript = wordCount < 100;
  
  // Check for segments
  const hasSegments = transcript.transcript_segments && 
                     safeArrayLength(transcript.transcript_segments) > 0;
  
  // Generate insights based on available data
  const insights = [];
  const warnings = [];
  
  // Add insights
  if (transcript.sentiment) {
    const sentimentValue = typeof transcript.sentiment === 'string' 
      ? (transcript.sentiment === 'positive' ? 0.8 : transcript.sentiment === 'negative' ? 0.2 : 0.5)
      : transcript.sentiment;
      
    if (sentimentValue > 0.7) {
      insights.push('Overall positive sentiment detected in this call');
    } else if (sentimentValue < 0.3) {
      insights.push('Negative sentiment detected - may need follow-up');
    }
  }
  
  // Add warnings
  if (isShortTranscript) {
    warnings.push('This transcript is unusually short - may be incomplete');
  }
  
  if (!hasSegments) {
    warnings.push('No transcript segments found - limited analytics available');
  }
  
  return {
    insights,
    warnings,
    keywords
  };
};

/**
 * Analyze keywords to identify trends
 * @param keywords Array of keywords
 */
export const analyzeKeywordTrends = (keywords: string[]) => {
  const keywordCounts: { [key: string]: number } = {};
  
  for (const keyword of keywords) {
    keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
  }
  
  // Sort keywords by frequency
  const sortedKeywords = Object.entries(keywordCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([keyword]) => keyword);
    
  return sortedKeywords;
};

/**
 * Classify keywords into categories
 * @param keywords Array of keywords
 */
export const classifyKeywords = (keywords: string[]) => {
  const positiveKeywords = keywords.filter(keyword => 
    keyword.toLowerCase().includes('good') ||
    keyword.toLowerCase().includes('great') ||
    keyword.toLowerCase().includes('excellent')
  );
  
  const negativeKeywords = keywords.filter(keyword =>
    keyword.toLowerCase().includes('bad') ||
    keyword.toLowerCase().includes('terrible') ||
    keyword.toLowerCase().includes('awful')
  );
  
  const neutralKeywords = keywords.filter(keyword =>
    !positiveKeywords.includes(keyword) &&
    !negativeKeywords.includes(keyword)
  );
  
  return {
    positive: positiveKeywords,
    negative: negativeKeywords,
    neutral: neutralKeywords
  };
};

/**
 * Analyze transcript to extract metrics
 * @param transcript The transcript to analyze 
 */
export const analyzeTranscript = (transcript: CallTranscript) => {
  // Ensure transcript exists
  if (!transcript) return null;
  
  // Get basic metrics
  const duration = transcript.duration || 0;
  const text = transcript.text || '';
  const keywords = transcript.keywords ? [...transcript.keywords] : [];
  
  // Check if we have segments
  const hasSegments = transcript.transcript_segments && 
                     safeArrayLength(transcript.transcript_segments) > 0;
  
  // Process segments if available
  const segmentMetrics = hasSegments 
    ? processTranscriptSegments(transcript)
    : {
        speakerTimeMap: {},
        speakerWordCounts: {},
        totalDuration: duration,
        silencePercentage: 0,
        agentInterruptions: 0,
        customerInterruptions: 0,
        sentiment: {
          agent: transcript.sentiment || 0.5,
          customer: transcript.sentiment || 0.5
        }
      };
  
  // Calculate talk ratio
  const totalTalkTime = 
    (segmentMetrics.speakerTimeMap.agent || 0) + 
    (segmentMetrics.speakerTimeMap.customer || 0);
    
  const talkRatio = {
    agent: totalTalkTime > 0 
      ? Math.round((segmentMetrics.speakerTimeMap.agent || 0) / totalTalkTime * 100) 
      : 50,
    customer: totalTalkTime > 0 
      ? Math.round((segmentMetrics.speakerTimeMap.customer || 0) / totalTalkTime * 100) 
      : 50
  };
  
  // Calculate word proportion
  const totalWords = 
    (segmentMetrics.speakerWordCounts.agent || 0) + 
    (segmentMetrics.speakerWordCounts.customer || 0);
    
  const wordProportion = {
    agent: totalWords > 0 
      ? Math.round((segmentMetrics.speakerWordCounts.agent || 0) / totalWords * 100) 
      : 50,
    customer: totalWords > 0 
      ? Math.round((segmentMetrics.speakerWordCounts.customer || 0) / totalWords * 100) 
      : 50
  };
  
  // Process insights  
  const insightsData = processTranscriptInsights(transcript);
  
  return {
    id: transcript.id,
    duration,
    text,
    keywords,
    talkRatio,
    wordProportion,
    silencePercentage: segmentMetrics.silencePercentage,
    agentInterruptions: segmentMetrics.agentInterruptions,
    customerInterruptions: segmentMetrics.customerInterruptions,
    sentiment: segmentMetrics.sentiment,
    insights: insightsData.insights,
    warnings: insightsData.warnings
  };
};
