
/**
 * Shared utility functions for advanced sales metrics analysis
 */

/**
 * Calculate talk ratio as a percentage
 * @param agentTalkTime Time agent spent talking (seconds)
 * @param customerTalkTime Time customer spent talking (seconds)
 * @returns Object with agent and customer talk percentages
 */
export const calculateTalkRatio = (agentTalkTime: number, customerTalkTime: number) => {
  const totalTime = agentTalkTime + customerTalkTime;
  if (totalTime === 0) return { agent: 50, customer: 50 };
  
  const agentRatio = (agentTalkTime / totalTime) * 100;
  
  return {
    agent: Math.round(agentRatio),
    customer: Math.round(100 - agentRatio)
  };
};

/**
 * Calculate conversion rate as a percentage
 * @param successfulCalls Number of successful calls
 * @param totalCalls Total number of calls
 * @returns Conversion rate percentage
 */
export const calculateConversionRate = (successfulCalls: number, totalCalls: number): number => {
  if (totalCalls === 0) return 0;
  return Math.round((successfulCalls / totalCalls) * 100);
};

/**
 * Calculate performance score based on multiple factors
 * @param params Object containing sentiment, talkRatio, and duration
 * @returns Performance score (0-100)
 */
export const calculatePerformanceScore = (params: {
  sentiment: { agent: number; customer: number };
  talkRatio: { agent: number; customer: number };
  duration: number;
  questionCount?: number;
  objectionHandling?: number;
  silenceRatio?: number;
}): number => {
  const { sentiment, talkRatio, duration, questionCount = 0, objectionHandling = 0.5, silenceRatio = 0.1 } = params;
  
  // Base score from sentiment (0-100)
  const sentimentAvg = (sentiment.agent + sentiment.customer) / 2;
  const sentimentComponent = sentimentAvg * 100;
  
  // Talk ratio component (penalize if agent talks too much or too little)
  const idealAgentRatio = 50;
  const talkRatioDeviation = Math.abs(talkRatio.agent - idealAgentRatio);
  const talkRatioComponent = 100 - talkRatioDeviation;
  
  // Duration component (calls between 3-10 minutes are ideal)
  const durationMinutes = duration / 60;
  let durationComponent = 100;
  if (durationMinutes < 3) {
    durationComponent = Math.min(100, durationMinutes * 33.3); // Scale up to 100 at 3 minutes
  } else if (durationMinutes > 10) {
    durationComponent = Math.max(0, 100 - ((durationMinutes - 10) * 10));
  }
  
  // Questions component (ideal is 15-25 questions per hour)
  let questionComponent = 50; // Default middle score
  const questionsPerHour = (questionCount / durationMinutes) * 60;
  if (questionsPerHour >= 15 && questionsPerHour <= 25) {
    questionComponent = 100;
  } else if (questionsPerHour < 15) {
    questionComponent = Math.max(0, 50 + ((questionsPerHour / 15) * 50));
  } else if (questionsPerHour > 25) {
    questionComponent = Math.max(0, 100 - ((questionsPerHour - 25) / 10 * 50));
  }
  
  // Objection handling component (0-100 scale)
  const objectionComponent = objectionHandling * 100;
  
  // Silence utilization component (ideal silence ratio is 5-15%)
  let silenceComponent = 50; // Default middle score
  const silencePercentage = silenceRatio * 100;
  if (silencePercentage >= 5 && silencePercentage <= 15) {
    silenceComponent = 100;
  } else if (silencePercentage < 5) {
    silenceComponent = Math.max(0, (silencePercentage / 5) * 100);
  } else if (silencePercentage > 15) {
    silenceComponent = Math.max(0, 100 - ((silencePercentage - 15) / 5 * 50));
  }
  
  // Weighted average for comprehensive score
  // Sentiment: 25%, Talk Ratio: 20%, Duration: 15%, Questions: 15%, Objection Handling: 15%, Silence: 10%
  const score = 
    (sentimentComponent * 0.25) + 
    (talkRatioComponent * 0.20) + 
    (durationComponent * 0.15) + 
    (questionComponent * 0.15) + 
    (objectionComponent * 0.15) + 
    (silenceComponent * 0.10);
  
  return Math.round(score);
};

// Add validation function to fix the error in RealTimeMetricsService.ts
export const validateMetricConsistency = (metrics: any) => {
  // Ensure metrics object exists
  if (!metrics) return false;
  
  // Check for essential metrics fields
  const requiredFields = ['performanceScore', 'conversionRate', 'totalCalls'];
  const hasAllRequiredFields = requiredFields.every(field => 
    metrics[field] !== undefined && !isNaN(Number(metrics[field]))
  );
  
  // Check for talk ratio consistency
  const hasTalkRatio = metrics.avgTalkRatio && 
    typeof metrics.avgTalkRatio.agent === 'number' && 
    typeof metrics.avgTalkRatio.customer === 'number' &&
    metrics.avgTalkRatio.agent + metrics.avgTalkRatio.customer === 100;
    
  // Check sentiment values are in valid range
  const validSentiment = metrics.avgSentiment === undefined || 
    (metrics.avgSentiment >= 0 && metrics.avgSentiment <= 1);
    
  return hasAllRequiredFields && hasTalkRatio && validSentiment;
};

/**
 * Analyze question patterns in transcript text
 * @param text Transcript text to analyze
 * @returns Object with question metrics
 */
export const analyzeQuestions = (text: string): {
  totalCount: number;
  openEndedCount: number;
  closedEndedCount: number;
  discoveryQuestions: string[];
  painPointQuestions: string[];
} => {
  if (!text) return { totalCount: 0, openEndedCount: 0, closedEndedCount: 0, discoveryQuestions: [], painPointQuestions: [] };
  
  // Common question patterns
  const openEndedMarkers = [
    'what', 'how', 'why', 'describe', 'tell me about', 'explain', 
    'what if', 'in what way', 'what would', 'what are', 'what were'
  ];
  
  const closedEndedMarkers = [
    'do you', 'did you', 'are you', 'will you', 'would you', 'have you', 
    'can you', 'could you', 'is there', 'are there', 'is it', 'was it'
  ];
  
  const discoveryMarkers = [
    'what challenges', 'how do you currently', 'tell me about your', 
    'what process', 'how would you describe', 'what are your goals',
    'what are you looking for', 'how do you see', 'what\'s important to you'
  ];
  
  const painPointMarkers = [
    'what frustrates', 'biggest challenge', 'what issues', 
    'pain points', 'most difficult', 'what problems', 
    'what\'s not working', 'what concerns'
  ];
  
  // Find all sentences ending with question marks
  const questionRegex = /[^.!?]*\?/g;
  const questions = text.match(questionRegex) || [];
  
  // Analyze question types
  let openEndedCount = 0;
  let closedEndedCount = 0;
  const discoveryQuestions: string[] = [];
  const painPointQuestions: string[] = [];
  
  questions.forEach(question => {
    const lowerQuestion = question.toLowerCase();
    
    // Check question type
    if (openEndedMarkers.some(marker => lowerQuestion.includes(marker))) {
      openEndedCount++;
    } else if (closedEndedMarkers.some(marker => lowerQuestion.includes(marker))) {
      closedEndedCount++;
    }
    
    // Check if discovery question
    if (discoveryMarkers.some(marker => lowerQuestion.includes(marker))) {
      discoveryQuestions.push(question.trim());
    }
    
    // Check if pain point question
    if (painPointMarkers.some(marker => lowerQuestion.includes(marker))) {
      painPointQuestions.push(question.trim());
    }
  });
  
  return {
    totalCount: questions.length,
    openEndedCount,
    closedEndedCount,
    discoveryQuestions,
    painPointQuestions
  };
};

/**
 * Analyze silence patterns in a transcript
 * @param segments Transcript segments with timestamps
 * @returns Analysis of silence patterns
 */
export const analyzeSilence = (segments: any[]): {
  totalSilenceTime: number;
  silenceRatio: number;
  silenceInstances: { start: number; duration: number }[];
  averageSilenceDuration: number;
  strategicSilenceCount: number;  // Silences after questions
} => {
  if (!segments || segments.length < 2) {
    return { 
      totalSilenceTime: 0, 
      silenceRatio: 0, 
      silenceInstances: [], 
      averageSilenceDuration: 0,
      strategicSilenceCount: 0
    };
  }
  
  const silenceInstances: { start: number; duration: number }[] = [];
  let strategicSilenceCount = 0;
  let totalSilenceTime = 0;
  let totalDuration = 0;
  
  // Find gaps between segments
  for (let i = 1; i < segments.length; i++) {
    const currentSegment = segments[i];
    const prevSegment = segments[i-1];
    
    if (currentSegment.start && prevSegment.end) {
      const gapDuration = currentSegment.start - prevSegment.end;
      
      // Only count gaps > 1 second as silence
      if (gapDuration > 1) {
        silenceInstances.push({
          start: prevSegment.end,
          duration: gapDuration
        });
        
        totalSilenceTime += gapDuration;
        
        // Check if previous segment ends with a question (strategic silence)
        if (prevSegment.text && prevSegment.text.trim().endsWith('?')) {
          strategicSilenceCount++;
        }
      }
    }
  }
  
  // Calculate total duration from first to last segment
  if (segments.length > 0) {
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    
    if (firstSegment.start !== undefined && lastSegment.end !== undefined) {
      totalDuration = lastSegment.end - firstSegment.start;
    }
  }
  
  const silenceRatio = totalDuration > 0 ? totalSilenceTime / totalDuration : 0;
  const averageSilenceDuration = silenceInstances.length > 0 ? 
    totalSilenceTime / silenceInstances.length : 0;
  
  return {
    totalSilenceTime,
    silenceRatio,
    silenceInstances,
    averageSilenceDuration,
    strategicSilenceCount
  };
};

/**
 * Analyze objection handling effectiveness
 * @param transcript Full transcript text
 * @returns Objection handling score (0-1)
 */
export const analyzeObjectionHandling = (transcript: string): {
  score: number;
  detectedObjections: string[];
  successfullyHandled: number;
} => {
  if (!transcript) return { score: 0, detectedObjections: [], successfullyHandled: 0 };
  
  const lowerTranscript = transcript.toLowerCase();
  
  // Common objection markers
  const objectionMarkers = [
    'too expensive', 'can\'t afford', 'costs too much',
    'need to think', 'not ready', 'need more time',
    'need to discuss', 'talk to', 'check with',
    'competitor', 'other options', 'alternatives',
    'not convinced', 'not sure', 'hesitant',
    'no budget', 'too complicated', 'too difficult'
  ];
  
  // Positive response markers (indicates successful handling)
  const positiveResponseMarkers = [
    'i see your point', 'i understand', 'that makes sense',
    'good question', 'appreciate', 'valid concern', 
    'you\'re right', 'fair point', 'let me address',
    'i hear you', 'let me explain', 'what if we',
    'we could', 'option', 'alternative', 'solution',
    'flexible', 'customize', 'adjust'
  ];
  
  const detectedObjections: string[] = [];
  let successfullyHandled = 0;
  
  // Analyze each sentence for objections
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  sentences.forEach((sentence, index) => {
    const lowerSentence = sentence.toLowerCase();
    
    // Check if sentence contains an objection
    const containsObjection = objectionMarkers.some(marker => lowerSentence.includes(marker));
    
    if (containsObjection) {
      detectedObjections.push(sentence.trim());
      
      // Check if next 3 sentences contain positive response markers
      const responseSentences = sentences.slice(index + 1, index + 4);
      const positiveResponse = responseSentences.some(s => 
        positiveResponseMarkers.some(marker => s.toLowerCase().includes(marker))
      );
      
      if (positiveResponse) {
        successfullyHandled++;
      }
    }
  });
  
  // Calculate score based on handling ratio
  const score = detectedObjections.length > 0 ? 
    successfullyHandled / detectedObjections.length : 0.5; // Default to middle if no objections
  
  return {
    score,
    detectedObjections,
    successfullyHandled
  };
};

/**
 * Calculate pain point identification score
 * @param transcript Full transcript text
 * @returns Score indicating effectiveness at identifying pain points (0-100)
 */
export const calculatePainPointScore = (transcript: string): {
  score: number;
  detectedPainPoints: string[];
} => {
  if (!transcript) return { score: 0, detectedPainPoints: [] };
  
  const lowerTranscript = transcript.toLowerCase();
  
  // Pain point markers
  const painPointMarkers = [
    'problem with', 'struggle with', 'challenge with',
    'difficult to', 'frustrating', 'pain point',
    'issue with', 'concerned about', 'worry about',
    'limitation', 'bottleneck', 'inefficient',
    'time-consuming', 'costly', 'expensive process',
    'manual process', 'error-prone', 'inconsistent'
  ];
  
  // Follow-up markers (indicates deeper exploration)
  const followUpMarkers = [
    'how does that affect', 'what impact', 'tell me more',
    'example', 'instance', 'elaborate', 'explain further',
    'how often', 'how long', 'how much', 'how many',
    'who else', 'which departments', 'what would happen if'
  ];
  
  const detectedPainPoints: string[] = [];
  let followUpCount = 0;
  
  // Extract sentences containing pain points
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  sentences.forEach((sentence, index) => {
    const lowerSentence = sentence.toLowerCase();
    
    // Check if sentence mentions a pain point
    const containsPainPoint = painPointMarkers.some(marker => lowerSentence.includes(marker));
    
    if (containsPainPoint) {
      detectedPainPoints.push(sentence.trim());
      
      // Check if next 2 sentences contain follow-up questions
      const nextSentences = sentences.slice(index + 1, index + 3);
      const hasFollowUp = nextSentences.some(s => 
        followUpMarkers.some(marker => s.toLowerCase().includes(marker))
      );
      
      if (hasFollowUp) {
        followUpCount++;
      }
    }
  });
  
  // Calculate score based on follow-up ratio and count
  let score = 0;
  if (detectedPainPoints.length > 0) {
    // Base score on follow-up ratio
    const followUpRatio = followUpCount / detectedPainPoints.length;
    
    // Adjust score based on total count of pain points detected (higher is better)
    const countFactor = Math.min(1, detectedPainPoints.length / 5); // Max out at 5 pain points
    
    // Combined score: 70% follow-up quality, 30% quantity
    score = (followUpRatio * 0.7 + countFactor * 0.3) * 100;
  }
  
  return {
    score: Math.round(score),
    detectedPainPoints
  };
};

/**
 * Analyze closing technique effectiveness
 * @param transcript Full transcript text
 * @returns Score and analysis of closing techniques
 */
export const analyzeClosingTechniques = (transcript: string): {
  score: number;
  techniqueUsed: string;
  nextStepsProposed: boolean;
  commitmentObtained: boolean;
} => {
  if (!transcript) {
    return { 
      score: 0, 
      techniqueUsed: 'None', 
      nextStepsProposed: false,
      commitmentObtained: false
    };
  }
  
  const lowerTranscript = transcript.toLowerCase();
  
  // Closing technique patterns
  const closingTechniques = {
    'Assumptive Close': ['when we get started', 'as we move forward', 'when we implement', 'once we begin'],
    'Summary Close': ['to summarize', 'let me recap', 'to sum up', 'the key points we covered'],
    'Question Close': ['does this solution address', 'would this solve', 'how does this sound', 'make sense?'],
    'Urgency Close': ['limited time', 'special offer', 'price increase', 'only available'],
    'Alternative Close': ['option a or option b', 'would you prefer', 'which would you rather', 'either']
  };
  
  // Next steps markers
  const nextStepsMarkers = [
    'next steps', 'moving forward', 'follow up', 
    'schedule', 'timeline', 'implementation',
    'get started', 'process', 'contract', 'agreement'
  ];
  
  // Commitment markers
  const commitmentMarkers = [
    'sounds good', 'let\'s do it', 'move forward', 
    'i agree', 'proceed', 'go ahead',
    'commit', 'sign', 'approve', 'budget'
  ];
  
  // Identify which closing technique was used
  let techniqueUsed = 'None';
  let techniqueStrength = 0;
  
  for (const [technique, patterns] of Object.entries(closingTechniques)) {
    const matchCount = patterns.filter(pattern => lowerTranscript.includes(pattern)).length;
    if (matchCount > techniqueStrength) {
      techniqueUsed = technique;
      techniqueStrength = matchCount;
    }
  }
  
  // Check for next steps
  const nextStepsProposed = nextStepsMarkers.some(marker => lowerTranscript.includes(marker));
  
  // Check for commitment
  const commitmentObtained = commitmentMarkers.some(marker => lowerTranscript.includes(marker));
  
  // Calculate score (33% technique used, 33% next steps, 33% commitment)
  let score = 0;
  if (techniqueStrength > 0) score += 33;
  if (nextStepsProposed) score += 33;
  if (commitmentObtained) score += 34;
  
  return {
    score,
    techniqueUsed,
    nextStepsProposed,
    commitmentObtained
  };
};

// Add new advanced metrics functions here

/**
 * Analyze filler words usage in transcript
 * @param transcript Full transcript text
 * @returns Analysis of filler words usage
 */
export const analyzeFillerWords = (transcript: string): {
  totalCount: number;
  frequency: Record<string, number>;
  densityScore: number; // 0-100, lower is better
  mostFrequent: string[];
} => {
  if (!transcript) return { totalCount: 0, frequency: {}, densityScore: 0, mostFrequent: [] };
  
  const fillerWords = [
    'um', 'uh', 'like', 'you know', 'sort of', 'kind of', 'i mean',
    'actually', 'basically', 'literally', 'so', 'anyway', 'right'
  ];
  
  const wordCount = transcript.split(/\s+/).length;
  const frequency: Record<string, number> = {};
  let totalCount = 0;
  
  // Count each filler word occurrence
  fillerWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = transcript.match(regex) || [];
    const count = matches.length;
    
    if (count > 0) {
      frequency[word] = count;
      totalCount += count;
    }
  });
  
  // Calculate density score (lower is better)
  // 5% or more filler words is considered poor (score: 100)
  // 0% filler words is ideal (score: 0)
  const densityScore = Math.min(100, Math.round((totalCount / wordCount) * 2000));
  
  // Get the most frequent filler words
  const sortedFillers = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
  
  return {
    totalCount,
    frequency,
    densityScore,
    mostFrequent: sortedFillers
  };
};

/**
 * Analyze talking speed in words per minute
 * @param transcript Full transcript text
 * @param durationSeconds Total duration in seconds
 * @returns Analysis of talking speed
 */
export const analyzeTalkingSpeed = (transcript: string, durationSeconds: number): {
  wordsPerMinute: number;
  qualityScore: number; // 0-100
  recommendation: string;
} => {
  if (!transcript || !durationSeconds) {
    return { wordsPerMinute: 0, qualityScore: 0, recommendation: 'No data available' };
  }
  
  // Count words (excluding punctuation)
  const words = transcript.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Calculate words per minute
  const minutes = durationSeconds / 60;
  const wpm = Math.round(wordCount / minutes);
  
  // Evaluate the pace (ideal range: 120-160 wpm for sales calls)
  let qualityScore = 0;
  let recommendation = '';
  
  if (wpm < 100) {
    qualityScore = Math.round((wpm / 100) * 70); // Scale up to 70 at 100 wpm
    recommendation = 'Speech is too slow. Try to be more energetic to engage the customer.';
  } else if (wpm < 120) {
    qualityScore = 70 + Math.round(((wpm - 100) / 20) * 15); // Scale from 70 to 85
    recommendation = 'Speech is slightly slow but understandable. Consider a slightly faster pace.';
  } else if (wpm <= 160) {
    qualityScore = 85 + Math.round(((160 - Math.abs(wpm - 140)) / 20) * 15); // Peak at 140 wpm
    recommendation = 'Excellent speaking pace. Well-balanced between clarity and engagement.';
  } else if (wpm <= 180) {
    qualityScore = 85 - Math.round(((wpm - 160) / 20) * 15); // Scale down from 85 to 70
    recommendation = 'Speech is slightly rushed. Consider slowing down for better clarity.';
  } else {
    qualityScore = Math.max(0, 70 - Math.round((wpm - 180) / 10)); // Decrease from 70 to 0
    recommendation = 'Speech is too fast. Significantly reduce your pace for customer comprehension.';
  }
  
  return {
    wordsPerMinute: wpm,
    qualityScore,
    recommendation
  };
};

/**
 * Analyze call energy and enthusiasm from transcript and audio features
 * @param params Object containing transcript and optional audio features
 * @returns Energy analysis
 */
export const analyzeCallEnergy = (params: {
  transcript: string;
  audioFeatures?: {
    volumeVariation?: number; // 0-1, higher means more dynamic range
    pitchVariation?: number; // 0-1, higher means more variable pitch
    speakingRateVariation?: number; // 0-1, higher means more variable pace
  }
}): {
  energyScore: number; // 0-100
  enthusiasmLevel: 'low' | 'moderate' | 'high';
  variabilityScore: number; // 0-100
  insights: string[];
} => {
  const { transcript, audioFeatures } = params;
  
  if (!transcript) {
    return { 
      energyScore: 0, 
      enthusiasmLevel: 'low', 
      variabilityScore: 0,
      insights: ['No transcript data available for energy analysis']
    };
  }
  
  // Energy words and phrases in transcript
  const energyMarkers = [
    'excited', 'amazing', 'fantastic', 'excellent', 'great',
    'love', 'perfect', 'absolutely', 'definitely', 'wonderful',
    'thrilled', 'delighted', 'incredible', 'brilliant', 'awesome'
  ];
  
  // Look for punctuation that indicates energy
  const exclamationCount = (transcript.match(/!/g) || []).length;
  const questionCount = (transcript.match(/\?/g) || []).length;
  
  // Calculate base energy score from text
  let energyWordCount = 0;
  energyMarkers.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = transcript.match(regex) || [];
    energyWordCount += matches.length;
  });
  
  // Word count for normalization
  const wordCount = transcript.split(/\s+/).length;
  
  // Base text energy score (0-60 points)
  const textEnergyScore = Math.min(60, Math.round((energyWordCount / wordCount) * 1000) + (exclamationCount * 3));
  
  // Audio feature energy score (0-40 points)
  let audioEnergyScore = 0;
  if (audioFeatures) {
    const { volumeVariation = 0, pitchVariation = 0, speakingRateVariation = 0 } = audioFeatures;
    audioEnergyScore = Math.round(
      (volumeVariation * 15) + 
      (pitchVariation * 15) + 
      (speakingRateVariation * 10)
    );
  } else {
    // If no audio features, estimate from text (less accurate)
    audioEnergyScore = Math.min(30, questionCount * 2 + exclamationCount * 3);
  }
  
  // Combined energy score
  const energyScore = Math.min(100, textEnergyScore + audioEnergyScore);
  
  // Determine enthusiasm level
  let enthusiasmLevel: 'low' | 'moderate' | 'high' = 'moderate';
  if (energyScore < 40) enthusiasmLevel = 'low';
  else if (energyScore > 70) enthusiasmLevel = 'high';
  
  // Calculate variability score
  const variabilityScore = audioFeatures ? 
    Math.round((audioFeatures.volumeVariation + audioFeatures.pitchVariation + audioFeatures.speakingRateVariation) * 33) : 
    Math.min(100, questionCount + exclamationCount * 2);
  
  // Generate insights
  const insights: string[] = [];
  
  if (energyScore < 40) {
    insights.push('Low energy detected. Try to sound more enthusiastic about your product/service.');
    insights.push('Consider varying your tone and speaking pace to engage the customer better.');
  } else if (energyScore < 70) {
    insights.push('Moderate energy level. Good baseline, but could be enhanced in key moments.');
    if (variabilityScore < 50) {
      insights.push('Try introducing more vocal variety to emphasize important points.');
    }
  } else {
    insights.push('Excellent energy level! Your enthusiasm comes through clearly.');
    if (variabilityScore > 80) {
      insights.push('Great vocal dynamics - you effectively use tone and pace to emphasize key points.');
    }
  }
  
  return {
    energyScore,
    enthusiasmLevel,
    variabilityScore,
    insights
  };
};

/**
 * Analyze value proposition delivery in sales calls
 * @param transcript Full transcript text
 * @returns Analysis of value proposition effectiveness
 */
export const analyzeValueProposition = (transcript: string): {
  clarity: number; // 0-100
  customization: number; // 0-100
  repetition: number; // Number of times value points mentioned
  keyValuePoints: string[];
  suggestions: string[];
} => {
  if (!transcript) {
    return { 
      clarity: 0, 
      customization: 0, 
      repetition: 0, 
      keyValuePoints: [],
      suggestions: ['No transcript available for value proposition analysis']
    };
  }
  
  // Value proposition markers
  const valueMarkers = [
    'benefit', 'value', 'advantage', 'saves', 'reduces', 'improves',
    'increases', 'enhances', 'better than', 'unique', 'exclusive',
    'special', 'tailored', 'customized', 'designed for', 'specifically for',
    'roi', 'return on investment', 'profitable', 'cost-effective'
  ];
  
  // Customer-specific markers (indicating personalization)
  const customizationMarkers = [
    'for your', 'in your case', 'your team', 'your company', 'your industry',
    'your situation', 'your needs', 'your requirements', 'your goals',
    'specifically for you', 'customize for', 'tailor for', 'adjust to',
    'based on what you said', 'from our discussion'
  ];
  
  // Extract sentences containing value propositions
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const valuePropositions: string[] = [];
  
  let customizationScore = 0;
  const mentionedValues: Record<string, number> = {};
  
  // Analyze each sentence
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    
    // Check for value markers
    for (const marker of valueMarkers) {
      if (lowerSentence.includes(marker)) {
        valuePropositions.push(sentence.trim());
        
        // Track how many times each value point is mentioned
        mentionedValues[marker] = (mentionedValues[marker] || 0) + 1;
        break; // Avoid counting same sentence multiple times
      }
    }
    
    // Check for customization markers
    for (const marker of customizationMarkers) {
      if (lowerSentence.includes(marker)) {
        customizationScore++;
        break; // Avoid counting same sentence multiple times
      }
    }
  });
  
  // Calculate clarity score based on uniqueness and specificity of value props
  const uniqueValueProps = new Set(valuePropositions).size;
  const clarityScore = Math.min(100, Math.round((uniqueValueProps / 5) * 40) + (valuePropositions.length > 0 ? 60 : 0));
  
  // Calculate adjusted customization score (max 100)
  const adjustedCustomizationScore = Math.min(100, Math.round((customizationScore / uniqueValueProps) * 100));
  
  // Create key value points by extracting most significant phrases
  const keyValuePoints = valuePropositions.slice(0, 5).map(vp => {
    // Simplify to extract core value statement (limit to 10 words)
    const simplified = vp.split(/\s+/).slice(0, 10).join(' ') + (vp.split(/\s+/).length > 10 ? '...' : '');
    return simplified;
  });
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (clarityScore < 50) {
    suggestions.push('Your value proposition needs more clarity. Be more specific about how your product/service delivers value.');
  }
  
  if (adjustedCustomizationScore < 60) {
    suggestions.push('Personalize your value statements more by connecting features directly to the customer\'s specific needs.');
  }
  
  if (Object.keys(mentionedValues).length < 3) {
    suggestions.push('Mention more diverse benefits of your product/service throughout the call.');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Excellent value proposition delivery! Continue reinforcing key points consistently.');
  }
  
  return {
    clarity: clarityScore,
    customization: adjustedCustomizationScore,
    repetition: Object.values(mentionedValues).reduce((sum, count) => sum + count, 0),
    keyValuePoints,
    suggestions
  };
};

export default {
  calculateTalkRatio,
  calculateConversionRate,
  calculatePerformanceScore,
  analyzeQuestions,
  analyzeSilence,
  analyzeObjectionHandling,
  calculatePainPointScore,
  analyzeClosingTechniques,
  analyzeFillerWords,
  analyzeTalkingSpeed,
  analyzeCallEnergy,
  analyzeValueProposition,
  validateMetricConsistency
};
