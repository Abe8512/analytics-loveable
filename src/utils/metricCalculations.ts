
/**
 * Calculate the total silence time in seconds from speech segments
 */

export type SpeakerType = "agent" | "customer" | "unknown";

export function calculateSilence(
  segments: { start: number; end: number; speaker: SpeakerType }[],
  totalDuration: number
): number {
  if (!segments.length) return totalDuration;
  
  // Sort segments by start time
  const sortedSegments = [...segments].sort((a, b) => a.start - b.start);
  
  // Calculate total speech time
  let speechTime = 0;
  
  for (const segment of sortedSegments) {
    speechTime += segment.end - segment.start;
  }
  
  // Silence is the difference
  return Math.max(0, totalDuration - speechTime);
}

/**
 * Calculate talk ratio between speakers
 */
export function calculateTalkRatio(
  segments: { start: number; end: number; speaker: SpeakerType }[]
): { agent: number; client: number } {
  if (!segments.length) return { agent: 50, client: 50 };
  
  let agentTime = 0;
  let clientTime = 0;
  
  for (const segment of segments) {
    const duration = segment.end - segment.start;
    
    if (segment.speaker === 'agent') {
      agentTime += duration;
    } else if (segment.speaker === 'customer') {
      clientTime += duration;
    }
  }
  
  const totalTalkTime = agentTime + clientTime;
  
  if (totalTalkTime === 0) {
    return { agent: 50, client: 50 };
  }
  
  const agentRatio = (agentTime / totalTalkTime) * 100;
  const clientRatio = (clientTime / totalTalkTime) * 100;
  
  return {
    agent: Math.round(agentRatio),
    client: Math.round(clientRatio)
  };
}
