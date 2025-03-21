
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

export default {
  calculateTalkRatio,
  calculateConversionRate,
  calculatePerformanceScore,
  analyzeQuestions,
  analyzeSilence,
  analyzeObjectionHandling,
  calculatePainPointScore,
  analyzeClosingTechniques
};
