
import { CallTranscript } from '@/types/call';
import { calculateSilence, calculateTalkRatio } from '@/utils/metricCalculations';
import { 
  AdvancedMetric, 
  TalkRatioMetrics, 
  ObjectionHandlingMetrics,
  SentimentHeatmapPoint,
  CallTranscriptSegment,
  safeSegmentCast
} from '@/types/metrics';

class AdvancedMetricsServiceClass {
  // Helper to safely process segments
  private processSegments(transcript: CallTranscript) {
    const segments = transcript.transcript_segments || [];
    
    // Skip if no segments are available
    if (!Array.isArray(segments) || segments.length === 0) {
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
      const rawSegment = segments[i];
      const segment = safeSegmentCast(rawSegment);
      const speaker = segment.speaker || 'unknown';
      const words = segment.text ? segment.text.split(/\s+/) : [];
      const duration = segment.end - segment.start;
      
      // Update speaker time
      speakerTimeMap[speaker] = (speakerTimeMap[speaker] || 0) + duration;
      
      // Update speaker word count
      speakerWordCounts[speaker] = (speakerWordCounts[speaker] || 0) + words.length;
      
      // Check for interruptions
      if (i > 0) {
        const prevRawSegment = segments[i - 1];
        const prevSegment = safeSegmentCast(prevRawSegment);
        
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
    
    // Convert segments to the format expected by calculateSilence
    const formattedSegments = segments.map(seg => {
      const segment = safeSegmentCast(seg);
      return {
        start: segment.start,
        end: segment.end,
        speaker: segment.speaker
      };
    });
    
    const silencePercentage = (calculateSilence(formattedSegments, totalDuration) / totalDuration) * 100;
    
    // Calculate sentiment scores
    const agentSentiment = typeof transcript.sentiment === 'number' ? transcript.sentiment : 0.5;
    const customerSentiment = typeof transcript.sentiment === 'number' ? transcript.sentiment : 0.5;
    
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
  }

  // Get advanced metrics for chart display
  getAdvancedMetrics(options: { period: string, groupBy: string }): Promise<AdvancedMetric[]> {
    // This would normally fetch from an API or database
    // For now, return mock data
    return Promise.resolve([
      { name: 'Jan', callVolume: 65, sentiment: 0.78, conversion: 24 },
      { name: 'Feb', callVolume: 59, sentiment: 0.65, conversion: 18 },
      { name: 'Mar', callVolume: 80, sentiment: 0.72, conversion: 26 },
      { name: 'Apr', callVolume: 81, sentiment: 0.78, conversion: 29 },
      { name: 'May', callVolume: 56, sentiment: 0.64, conversion: 15 },
      { name: 'Jun', callVolume: 55, sentiment: 0.70, conversion: 20 },
      { name: 'Jul', callVolume: 40, sentiment: 0.75, conversion: 22 }
    ]);
  }

  // Calculate talk ratios from a transcript
  calculateTalkRatios(transcript: CallTranscript): TalkRatioMetrics {
    const segmentMetrics = this.processSegments(transcript);
    
    const agentTalkTime = segmentMetrics.speakerTimeMap.agent || 0;
    const prospectTalkTime = segmentMetrics.speakerTimeMap.customer || 0;
    const totalTalkTime = agentTalkTime + prospectTalkTime;
    
    // Calculate ratios (avoid division by zero)
    const agentRatio = totalTalkTime > 0 ? agentTalkTime / totalTalkTime : 0.5;
    const prospectRatio = totalTalkTime > 0 ? prospectTalkTime / totalTalkTime : 0.5;
    
    // Calculate dominance score - a measure of how much one party dominates
    const dominanceScore = totalTalkTime > 0 
      ? Math.max(agentRatio, prospectRatio) / Math.min(Math.max(agentRatio, prospectRatio), 0.001)
      : 1;
    
    return {
      agent_ratio: agentRatio,
      prospect_ratio: prospectRatio,
      dominance_score: dominanceScore,
      agent_talk_time: agentTalkTime,
      prospect_talk_time: prospectTalkTime,
      silence_time: calculateSilence(
        transcript.transcript_segments?.map(seg => safeSegmentCast(seg)).map(seg => ({
          start: seg.start,
          end: seg.end,
          speaker: seg.speaker
        })) || [], 
        transcript.duration || 0
      ),
      interruption_count: segmentMetrics.agentInterruptions + segmentMetrics.customerInterruptions
    };
  }

  // Generate a heatmap of sentiment over time
  generateSentimentHeatmap(transcript: CallTranscript): SentimentHeatmapPoint[] {
    // This would normally analyze transcript segments for sentiment
    // For now, return mock data based on transcript duration
    if (!transcript || !transcript.duration) {
      return [];
    }
    
    const duration = transcript.duration;
    const segments = Array.isArray(transcript.transcript_segments) ? transcript.transcript_segments : [];
    
    // If no segments, generate mock data
    if (segments.length === 0) {
      const points: SentimentHeatmapPoint[] = [];
      const segmentCount = 6; // Generate 6 points
      
      for (let i = 0; i < segmentCount; i++) {
        const time = (duration / segmentCount) * i;
        const score = Math.random() * 0.5 + 0.4; // Random score between 0.4 and 0.9
        const sentiment = score > 0.7 ? 'POSITIVE' : score < 0.4 ? 'NEGATIVE' : 'NEUTRAL';
        
        points.push({
          time,
          score,
          label: sentiment,
          text_snippet: `Sample text for ${sentiment.toLowerCase()} sentiment...`
        });
      }
      
      return points;
    }
    
    // Use actual segments to generate heatmap
    const heatmapPoints: SentimentHeatmapPoint[] = [];
    const safeSegments = segments.map(seg => safeSegmentCast(seg));
    
    for (let i = 0; i < safeSegments.length; i += Math.ceil(safeSegments.length / 6)) {
      const segment = safeSegments[i];
      if (!segment) continue;
      
      // Generate a sentiment score (would normally be analyzed from text)
      const score = Math.random() * 0.5 + 0.4;
      const sentiment = score > 0.7 ? 'POSITIVE' : score < 0.4 ? 'NEGATIVE' : 'NEUTRAL';
      
      heatmapPoints.push({
        time: segment.start,
        score,
        label: sentiment,
        text_snippet: segment.text || 'No text available'
      });
    }
    
    return heatmapPoints;
  }

  // Calculate objection handling metrics
  calculateObjectionHandling(transcript: CallTranscript): ObjectionHandlingMetrics {
    // This would normally analyze the transcript for objections
    // For now, return mock data
    const objectionCount = Math.floor(Math.random() * 4) + 1; // 1-4 objections
    const handledCount = Math.floor(Math.random() * objectionCount) + 1; // At least 1 handled
    
    const details = [];
    const duration = transcript.duration || 300;
    
    // Generate mock objection details
    for (let i = 0; i < objectionCount; i++) {
      const time = Math.floor(Math.random() * duration);
      const handled = i < handledCount;
      
      details.push({
        time,
        text: `Customer raised concern about ${handled ? 'pricing' : 'product features'}`,
        handled
      });
    }
    
    return {
      total_objections: objectionCount,
      handled_objections: handledCount,
      effectiveness: objectionCount > 0 ? handledCount / objectionCount : 0,
      details
    };
  }

  // Analyze transcript to extract metrics
  analyzeTranscript(transcript: CallTranscript) {
    // Ensure transcript exists
    if (!transcript) return null;
    
    // Get basic metrics
    const duration = transcript.duration || 0;
    const segments = transcript.transcript_segments || [];
    
    // Process segments if available
    const segmentMetrics = this.processSegments(transcript);
    
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
    
    return {
      id: transcript.id,
      duration,
      talkRatio,
      silencePercentage: segmentMetrics.silencePercentage,
      agentInterruptions: segmentMetrics.agentInterruptions,
      customerInterruptions: segmentMetrics.customerInterruptions,
      sentiment: segmentMetrics.sentiment
    };
  }
}

export const AdvancedMetricsService = new AdvancedMetricsServiceClass();
