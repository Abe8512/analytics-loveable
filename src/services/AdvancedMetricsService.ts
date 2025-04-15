import { CallTranscriptSegment } from "@/types/call";
import { safeNumber } from "@/utils/safeFunctions";

export interface TalkRatioMetrics {
  totalDuration: number;
  agentTalkTime: number;
  customerTalkTime: number;
  agentTalkPercentage: number;
  customerTalkPercentage: number;
  silenceTime: number;
  silencePercentage: number;
  longestMonologue: number;
  monologueSpeaker: string;
}

export interface ObjectionHandlingMetrics {
  objectionCount: number;
  successfullyAddressedCount: number;
  successRate: number;
  avgResponseTime: number;
  commonObjections: string[];
}

export interface SentimentHeatmapPoint {
  time: number;
  agent: number;
  customer: number;
}

export interface AdvancedMetric {
  name: string;
  value: number;
  unit: string;
  description: string;
  improvement?: string;
}

export class AdvancedMetricsServiceClass {
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

  /**
   * Calculates the talk ratio between the agent and the customer during a call from a list of transcript segments.
   *
   * @param {CallTranscriptSegment[]} segments - An array of transcript segments, each containing speaker and duration information.
   * @returns {{ totalDuration: number; agentTalkTime: number; customerTalkTime: number; agentTalkPercentage: number; customerTalkPercentage: number; silenceTime: number; silencePercentage: number; longestMonologue: number; monologueSpeaker: string }} An object containing the total duration of the call, talk time for the agent and customer, talk percentages, silence time and percentage, and the longest monologue.
   * Returns an object with all values set to 0 if the input is invalid or no talk time could be calculated.
   */
  calculateTalkRatio(segments: CallTranscriptSegment[]): TalkRatioMetrics {
    if (!segments || !Array.isArray(segments)) {
      console.error("Invalid input: segments must be a non-empty array.");
      return {
        totalDuration: 0,
        agentTalkTime: 0,
        customerTalkTime: 0,
        agentTalkPercentage: 0,
        customerTalkPercentage: 0,
        silenceTime: 0,
        silencePercentage: 0,
        longestMonologue: 0,
        monologueSpeaker: '',
      };
    }

    let totalDuration = 0;
    let agentTalkTime = 0;
    let customerTalkTime = 0;
    let silenceTime = 0;

    try {
      segments.forEach((segment) => {
        if (typeof segment.start !== 'number' || typeof segment.end !== 'number') {
          console.warn("Skipping segment due to missing or invalid start/end:", segment);
          return;
        }

        const duration = segment.end - segment.start;
        if (duration <= 0) {
          console.warn("Skipping segment due to non-positive duration:", segment);
          return;
        }

        totalDuration += duration;

        if (segment.speaker && typeof segment.speaker === 'string') {
          const speaker = segment.speaker.toLowerCase();
          if (speaker === 'agent') {
            agentTalkTime += duration;
          } else if (speaker === 'customer') {
            customerTalkTime += duration;
          } else if (speaker === 'silence') {
            silenceTime += duration;
          }
        }
      });

      const speakerTalkTime = this.calculateTalkTimeByRole(segments) || { agent: 0, customer: 0 };
      const agentTalkTime = speakerTalkTime.agent || 0;
      const customerTalkTime = speakerTalkTime.customer || 0;

      const agentTalkPercentage = totalDuration > 0 ? (agentTalkTime / totalDuration) * 100 : 0;
      const customerTalkPercentage = totalDuration > 0 ? (customerTalkTime / totalDuration) * 100 : 0;
      const silencePercentage = totalDuration > 0 ? (silenceTime / totalDuration) * 100 : 0;

      const longestMonologueData = this.calculateLongestMonologue(segments);

      return {
        totalDuration,
        agentTalkTime,
        customerTalkTime,
        agentTalkPercentage,
        customerTalkPercentage,
        silenceTime,
        silencePercentage,
        longestMonologue: longestMonologueData.duration,
        monologueSpeaker: longestMonologueData.speaker,
      };
    } catch (error) {
      console.error("Error calculating talk ratio:", error);
      return {
        totalDuration: 0,
        agentTalkTime: 0,
        customerTalkTime: 0,
        agentTalkPercentage: 0,
        customerTalkPercentage: 0,
        silenceTime: 0,
        silencePercentage: 0,
        longestMonologue: 0,
        monologueSpeaker: '',
      };
    }
  }

  /**
   * Calculates metrics related to objection handling during a call from a list of transcript segments.
   *
   * @param {CallTranscriptSegment[]} segments - An array of transcript segments to analyze for objections and responses.
   * @returns {{ objectionCount: number; successfullyAddressedCount: number; successRate: number; avgResponseTime: number; commonObjections: string[] }} An object containing the total number of objections, the number of successfully addressed objections, the success rate, the average response time, and a list of common objections.
   * Returns an object with all values set to 0 if the input is invalid or no objections could be identified.
   */
  calculateObjectionHandlingMetrics(segments: CallTranscriptSegment[]): ObjectionHandlingMetrics {
    if (!segments || !Array.isArray(segments)) {
      console.error("Invalid input: segments must be a non-empty array.");
      return {
        objectionCount: 0,
        successfullyAddressedCount: 0,
        successRate: 0,
        avgResponseTime: 0,
        commonObjections: [],
      };
    }

    let objectionCount = 0;
    let successfullyAddressedCount = 0;
    let totalResponseTime = 0;
    const objections: string[] = [];

    try {
      segments.forEach((segment, index) => {
        if (segment.text && typeof segment.text === 'string') {
          const lowerCaseText = segment.text.toLowerCase();
          if (lowerCaseText.includes("i disagree") || lowerCaseText.includes("i don't agree") || lowerCaseText.includes("that won't work for me")) {
            objectionCount++;
            objections.push(segment.text);

            // Check if the next segment addresses the objection
            if (index < segments.length - 1) {
              const nextSegment = segments[index + 1];
              if (nextSegment.speaker === 'agent' && nextSegment.text && typeof nextSegment.text === 'string') {
                successfullyAddressedCount++;
                totalResponseTime += nextSegment.start - segment.start;
              }
            }
          }
        }
      });

      const successRate = objectionCount > 0 ? (successfullyAddressedCount / objectionCount) * 100 : 0;
      const avgResponseTime = successfullyAddressedCount > 0 ? totalResponseTime / successfullyAddressedCount : 0;

      // Get common objections
      const objectionCounts: { [objection: string]: number } = {};
      objections.forEach((objection) => {
        objectionCounts[objection] = (objectionCounts[objection] || 0) + 1;
      });

      const commonObjections = Object.keys(objectionCounts)
        .sort((a, b) => objectionCounts[b] - objectionCounts[a])
        .slice(0, 5);

      return {
        objectionCount,
        successfullyAddressedCount,
        successRate,
        avgResponseTime,
        commonObjections,
      };
    } catch (error) {
      console.error("Error calculating objection handling metrics:", error);
      return {
        objectionCount: 0,
        successfullyAddressedCount: 0,
        successRate: 0,
        avgResponseTime: 0,
        commonObjections: [],
      };
    }
  }
}

export const AdvancedMetricsService = new AdvancedMetricsServiceClass();
