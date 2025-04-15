import { CallTranscript, CallTranscriptSegment } from "@/types/call";
import { safeNumber } from "@/utils/safeFunctions";

export interface TalkRatioMetrics {
  // Keep camelCase properties for TypeScript standards
  agentRatio: number;
  prospectRatio: number;
  dominanceScore: number;
  agentTalkTime: number;
  prospectTalkTime: number;
  silenceTime: number;
  interruptionCount: number;
  
  // Add snake_case aliases for component compatibility
  agent_ratio: number;
  prospect_ratio: number;
  dominance_score: number;
  agent_talk_time: number;
  prospect_talk_time: number;
  silence_time: number;
  interruption_count: number;
}

export interface ObjectionHandlingMetrics {
  // Keep camelCase properties for TypeScript standards
  objectionCount: number;
  successfullyAddressedCount: number;
  successRate: number;
  avgResponseTime: number;
  commonObjections: string[];
  
  // Add snake_case aliases for component compatibility
  total_objections: number;
  handled_objections: number;
  effectiveness: number;
  details: Array<{
    text: string;
    time: number;
    handled: boolean;
  }>;
}

export interface SentimentHeatmapPoint {
  time: number;
  agent: number;
  customer: number;
  score: number;
  label: string;
  text_snippet: string;
}

export interface AdvancedMetric {
  name: string;
  value: number;
  unit: string;
  description: string;
  improvement?: string;
  callVolume?: number;
  sentiment?: number;
  conversion?: number;
}

export class AdvancedMetricsServiceClass {
  // Method to get advanced metrics for the chart component
  getAdvancedMetrics(options: { period?: string; groupBy?: string; }): Promise<AdvancedMetric[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Sample data for demonstration
        const metrics: AdvancedMetric[] = [
          { name: 'Week 1', callVolume: 42, sentiment: 0.75, conversion: 18, value: 42, unit: 'calls', description: 'Weekly call volume' },
          { name: 'Week 2', callVolume: 38, sentiment: 0.68, conversion: 15, value: 38, unit: 'calls', description: 'Weekly call volume' },
          { name: 'Week 3', callVolume: 56, sentiment: 0.82, conversion: 24, value: 56, unit: 'calls', description: 'Weekly call volume' },
          { name: 'Week 4', callVolume: 64, sentiment: 0.79, conversion: 28, value: 64, unit: 'calls', description: 'Weekly call volume' },
        ];
        resolve(metrics);
      }, 500);
    });
  }

  // Talk ratio analysis methods
  calculateTalkRatio(transcript: CallTranscript): TalkRatioMetrics {
    // Default values if calculation fails
    const defaultMetrics: TalkRatioMetrics = {
      agentRatio: 0.5,
      prospectRatio: 0.5,
      dominanceScore: 1.0,
      agentTalkTime: 0,
      prospectTalkTime: 0,
      silenceTime: 0,
      interruptionCount: 0,
      
      // Snake case aliases
      agent_ratio: 0.5,
      prospect_ratio: 0.5,
      dominance_score: 1.0,
      agent_talk_time: 0,
      prospect_talk_time: 0,
      silence_time: 0,
      interruption_count: 0
    };
    
    try {
      if (!transcript || !transcript.transcript_segments || !Array.isArray(transcript.transcript_segments)) {
        return defaultMetrics;
      }
      
      const segments = transcript.transcript_segments;
      let totalDuration = 0;
      let agentTime = 0;
      let customerTime = 0;
      let silenceTime = 0;
      let interruptions = 0;
      
      // Calculate talk times
      segments.forEach((segment) => {
        const duration = (segment.end || 0) - (segment.start || 0);
        if (duration <= 0) return;
        
        totalDuration += duration;
        
        if (segment.speaker?.toLowerCase().includes('agent')) {
          agentTime += duration;
        } else if (segment.speaker?.toLowerCase().includes('customer')) {
          customerTime += duration;
        } else {
          silenceTime += duration;
        }
      });
      
      // Count interruptions (simplified logic)
      for (let i = 1; i < segments.length; i++) {
        const prevSegment = segments[i-1];
        const currSegment = segments[i];
        if (prevSegment.speaker !== currSegment.speaker && 
            (currSegment.start || 0) - (prevSegment.end || 0) < 0.5) {
          interruptions++;
        }
      }
      
      // Calculate ratios
      const totalSpeakingTime = agentTime + customerTime;
      const agentRatio = totalSpeakingTime > 0 ? agentTime / totalSpeakingTime : 0.5;
      const prospectRatio = totalSpeakingTime > 0 ? customerTime / totalSpeakingTime : 0.5;
      
      // Calculate dominance score (agent talk time / customer talk time)
      const dominanceScore = customerTime > 0 ? agentTime / customerTime : 
                            (agentTime > 0 ? 2.0 : 1.0);
      
      return {
        agentRatio,
        prospectRatio,
        dominanceScore,
        agentTalkTime: agentTime,
        prospectTalkTime: customerTime,
        silenceTime,
        interruptionCount: interruptions,
        
        // Snake case aliases for component compatibility
        agent_ratio: agentRatio,
        prospect_ratio: prospectRatio,
        dominance_score: dominanceScore,
        agent_talk_time: agentTime,
        prospect_talk_time: customerTime,
        silence_time: silenceTime,
        interruption_count: interruptions
      };
    } catch (error) {
      console.error("Error calculating talk ratio:", error);
      return defaultMetrics;
    }
  }
  
  // Alias for component compatibility
  calculateTalkRatios(transcript: CallTranscript): TalkRatioMetrics {
    return this.calculateTalkRatio(transcript);
  }
  
  generateSentimentHeatmap(transcript: CallTranscript): SentimentHeatmapPoint[] {
    try {
      if (!transcript || !transcript.transcript_segments || !Array.isArray(transcript.transcript_segments)) {
        return [];
      }
      
      const segments = transcript.transcript_segments;
      const heatmapPoints: SentimentHeatmapPoint[] = [];
      
      segments.forEach((segment, index) => {
        // Skip segments without sentiment data
        if (segment.sentiment === undefined) return;
        
        const segmentTime = segment.start || 0;
        const sentimentScore = typeof segment.sentiment === 'number' ? segment.sentiment : 0.5;
        
        // Determine sentiment label based on score
        let label = 'NEUTRAL';
        if (sentimentScore > 0.6) label = 'POSITIVE';
        if (sentimentScore < 0.4) label = 'NEGATIVE';
        
        heatmapPoints.push({
          time: segmentTime,
          agent: sentimentScore,
          customer: sentimentScore,
          score: sentimentScore,
          label,
          text_snippet: segment.text?.substring(0, 50) || ''
        });
      });
      
      return heatmapPoints;
    } catch (error) {
      console.error("Error generating sentiment heatmap:", error);
      return [];
    }
  }
  
  calculateObjectionHandlingMetrics(transcript: CallTranscript): ObjectionHandlingMetrics {
    const defaultMetrics: ObjectionHandlingMetrics = {
      objectionCount: 0,
      successfullyAddressedCount: 0,
      successRate: 0,
      avgResponseTime: 0,
      commonObjections: [],
      
      // Snake case aliases
      total_objections: 0,
      handled_objections: 0,
      effectiveness: 0,
      details: []
    };
    
    try {
      if (!transcript || !transcript.transcript_segments || !Array.isArray(transcript.transcript_segments)) {
        return defaultMetrics;
      }
      
      const segments = transcript.transcript_segments;
      let objections = 0;
      let handledObjections = 0;
      let totalResponseTime = 0;
      const objectionDetails: Array<{text: string; time: number; handled: boolean}> = [];
      
      // Objection keywords
      const objectionKeywords = [
        'no', 'not interested', 'too expensive', 'can\'t afford', 
        'not now', 'competitor', 'think about', 'not sure'
      ];
      
      // Detect objections and responses
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const text = segment.text?.toLowerCase() || '';
        
        // Check if this segment contains an objection
        const isObjection = objectionKeywords.some(keyword => text.includes(keyword));
        
        if (isObjection && segment.speaker?.toLowerCase().includes('customer')) {
          objections++;
          const time = segment.start || 0;
          
          // Check if the objection was addressed in the next segments
          let handled = false;
          let responseTime = 0;
          
          // Look at the next 3 segments for a response
          for (let j = i+1; j < i+4 && j < segments.length; j++) {
            const responseSegment = segments[j];
            
            if (responseSegment.speaker?.toLowerCase().includes('agent')) {
              handled = true;
              responseTime = (responseSegment.start || 0) - time;
              break;
            }
          }
          
          if (handled) {
            handledObjections++;
            totalResponseTime += responseTime;
          }
          
          objectionDetails.push({
            text: segment.text || '',
            time: time,
            handled
          });
        }
      }
      
      // Calculate effectiveness and avg response time
      const effectiveness = objections > 0 ? handledObjections / objections : 0;
      const avgResponseTime = handledObjections > 0 ? totalResponseTime / handledObjections : 0;
      
      return {
        objectionCount: objections,
        successfullyAddressedCount: handledObjections,
        successRate: effectiveness * 100,
        avgResponseTime,
        commonObjections: [],
        
        // Snake case aliases
        total_objections: objections,
        handled_objections: handledObjections,
        effectiveness,
        details: objectionDetails
      };
    } catch (error) {
      console.error("Error calculating objection handling metrics:", error);
      return defaultMetrics;
    }
  }
  
  // Alias for component compatibility
  calculateObjectionHandling(transcript: CallTranscript): ObjectionHandlingMetrics {
    return this.calculateObjectionHandlingMetrics(transcript);
  }
  
  /**
   * Calculates the talk time for each speaker role (agent and customer) in a list of transcript segments.
   *
   * @param {CallTranscriptSegment[]} segments - An array of transcript segments, each containing speaker and duration information.
   * @returns {{ [speaker: string]: number } | {}} An object where keys are speaker roles ('agent' or 'customer') and values are the total talk time in seconds.
   * Returns an empty object if the input is invalid or no talk time could be calculated.
   */
  calculateTalkTimeByRole(segments: CallTranscriptSegment[]): { [speaker: string]: number } | {} {
    if (!segments || !Array.isArray(segments)) {
      console.error("Invalid input: segments must be a non-empty array.");
      return {};
    }

    const talkTimeByRole: { [speaker: string]: number } = {};

    try {
      segments.forEach((segment) => {
        if (!segment.speaker || typeof segment.start !== 'number' || typeof segment.end !== 'number') {
          console.warn("Skipping segment due to missing or invalid speaker/start/end:", segment);
          return;
        }

        const duration = segment.end - segment.start;
        if (duration <= 0) {
          console.warn("Skipping segment due to non-positive duration:", segment);
          return;
        }

        const speaker = segment.speaker.toLowerCase();
        talkTimeByRole[speaker] = (talkTimeByRole[speaker] || 0) + duration;
      });

      return talkTimeByRole;
    } catch (error) {
      console.error("Error calculating talk time by role:", error);
      return {};
    }
  }

  /**
   * Identifies and counts objections raised during a call from a list of transcript segments.
   *
   * @param {CallTranscriptSegment[]} segments - An array of transcript segments to analyze for objections.
   * @returns {number} The total number of objections identified in the segments.
   */
  countObjections(segments: CallTranscriptSegment[]): number {
    if (!segments || !Array.isArray(segments)) {
      console.error("Invalid input: segments must be a non-empty array.");
      return 0;
    }

    let objectionCount = 0;
    try {
      segments.forEach((segment) => {
        if (segment.text && typeof segment.text === 'string') {
          const lowerCaseText = segment.text.toLowerCase();
          if (lowerCaseText.includes("i disagree") || lowerCaseText.includes("i don't agree") || lowerCaseText.includes("that won't work for me")) {
            objectionCount++;
          }
        }
      });
    } catch (error) {
      console.error("Error counting objections:", error);
    }
    return objectionCount;
  }

  /**
   * Calculates sentiment trends over time from a list of transcript segments.
   *
   * @param {CallTranscriptSegment[]} segments - An array of transcript segments, each containing a sentiment score and timestamp.
   * @returns {{ time: number; agent: number; customer: number }[]} An array of objects, each representing a sentiment data point with time, agent sentiment, and customer sentiment.
   * Returns an empty array if the input is invalid or no sentiment data could be extracted.
   */
  calculateSentimentTrends(segments: CallTranscriptSegment[]): SentimentHeatmapPoint[] {
    if (!segments || !Array.isArray(segments)) {
      console.error("Invalid input: segments must be a non-empty array.");
      return [];
    }

    const sentimentTrends: SentimentHeatmapPoint[] = [];
    try {
      segments.forEach((segment) => {
        if (typeof segment.start === 'number' && typeof segment.sentiment === 'number') {
          sentimentTrends.push({
            time: segment.start,
            agent: segment.sentiment,
            customer: segment.sentiment,
            score: segment.sentiment,
            label: segment.sentiment > 0.6 ? 'POSITIVE' : segment.sentiment < 0.4 ? 'NEGATIVE' : 'NEUTRAL',
            text_snippet: segment.text?.substring(0, 50) || ''
          });
        }
      });
    } catch (error) {
      console.error("Error calculating sentiment trends:", error);
    }
    return sentimentTrends;
  }

  /**
   * Analyzes the frequency and types of questions asked during a call from a list of transcript segments.
   *
   * @param {CallTranscriptSegment[]} segments - An array of transcript segments to analyze for questions.
   * @returns {{ [question: string]: number }} An object where keys are questions and values are the frequency of each question.
   * Returns an empty object if the input is invalid or no questions could be identified.
   */
  analyzeQuestionFrequency(segments: CallTranscriptSegment[]): { [question: string]: number } {
    if (!segments || !Array.isArray(segments)) {
      console.error("Invalid input: segments must be a non-empty array.");
      return {};
    }

    const questionFrequency: { [question: string]: number } = {};
    try {
      segments.forEach((segment) => {
        if (segment.text && typeof segment.text === 'string' && segment.text.includes("?")) {
          const question = segment.text.trim();
          questionFrequency[question] = (questionFrequency[question] || 0) + 1;
        }
      });
    } catch (error) {
      console.error("Error analyzing question frequency:", error);
    }
    return questionFrequency;
  }

  /**
   * Identifies and counts key phrases or keywords used during a call from a list of transcript segments.
   *
   * @param {CallTranscriptSegment[]} segments - An array of transcript segments to analyze for key phrases or keywords.
   * @returns {{ [keyword: string]: number }} An object where keys are keywords and values are the frequency of each keyword.
   * Returns an empty object if the input is invalid or no keywords could be identified.
   */
  identifyKeyPhrases(segments: CallTranscriptSegment[]): { [keyword: string]: number } {
    if (!segments || !Array.isArray(segments)) {
      console.error("Invalid input: segments must be a non-empty array.");
      return {};
    }

    const keyPhrases: { [keyword: string]: number } = {};
    try {
      segments.forEach((segment) => {
        if (segment.text && typeof segment.text === 'string') {
          const words = segment.text.toLowerCase().split(/\s+/);
          words.forEach((word) => {
            keyPhrases[word] = (keyPhrases[word] || 0) + 1;
          });
        }
      });
    } catch (error) {
      console.error("Error identifying key phrases:", error);
    }
    return keyPhrases;
  }

  /**
   * Calculates the duration of the longest monologue (uninterrupted speech) during a call from a list of transcript segments.
   *
   * @param {CallTranscriptSegment[]} segments - An array of transcript segments to analyze for monologues.
   * @returns {{ duration: number; speaker: string }} An object containing the duration of the longest monologue in seconds and the speaker.
   * Returns an object with duration 0 and empty speaker if the input is invalid or no monologues could be identified.
   */
  calculateLongestMonologue(segments: CallTranscriptSegment[]): { duration: number; speaker: string } {
    if (!segments || !Array.isArray(segments)) {
      console.error("Invalid input: segments must be a non-empty array.");
      return { duration: 0, speaker: '' };
    }

    let longestMonologue = 0;
    let monologueSpeaker = '';
    try {
      let currentMonologueStart = 0;
      let currentMonologueSpeaker = '';
      let currentMonologueDuration = 0;

      segments.forEach((segment, index) => {
        if (!segment.speaker || typeof segment.start !== 'number' || typeof segment.end !== 'number') {
          console.warn("Skipping segment due to missing or invalid speaker/start/end:", segment);
          return;
        }

        if (index === 0) {
          currentMonologueStart = segment.start;
          currentMonologueSpeaker = segment.speaker;
          currentMonologueDuration = segment.end - segment.start;
        } else {
          const previousSegment = segments[index - 1];
          if (previousSegment.speaker === segment.speaker) {
            currentMonologueDuration += segment.end - segment.start;
          } else {
            if (currentMonologueDuration > longestMonologue) {
              longestMonologue = currentMonologueDuration;
              monologueSpeaker = currentMonologueSpeaker;
            }
            currentMonologueStart = segment.start;
            currentMonologueSpeaker = segment.speaker;
            currentMonologueDuration = segment.end - segment.start;
          }
        }
      });

      // Check if the last monologue is the longest
      if (currentMonologueDuration > longestMonologue) {
        longestMonologue = currentMonologueDuration;
        monologueSpeaker = currentMonologueSpeaker;
      }
    } catch (error) {
      console.error("Error calculating longest monologue:", error);
    }
    return { duration: longestMonologue, speaker: monologueSpeaker };
  }
}

export const AdvancedMetricsService = new AdvancedMetricsServiceClass();
