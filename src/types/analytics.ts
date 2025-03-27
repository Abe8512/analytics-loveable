
export interface TeamPerformance {
  id: string;
  name: string;
  calls: number;
  successRate: number;
  avgSentiment: number; // Changed from string to number
  conversionRate: number;
}
