// Only updating the incompatible return types
import { TeamPerformance } from '@/types/teamTypes';

export class TeamMetricsServiceClass {
  private static instance: TeamMetricsServiceClass;
  
  constructor() {
    // Initialize service
  }
  
  static getInstance(): TeamMetricsServiceClass {
    if (!TeamMetricsServiceClass.instance) {
      TeamMetricsServiceClass.instance = new TeamMetricsServiceClass();
    }
    return TeamMetricsServiceClass.instance;
  }
  
  async getTeamPerformanceMetrics() {
    try {
      // Try to fetch from API or database
      const metrics = await this.fetchTeamPerformanceMetrics();
      return metrics;
    } catch (error) {
      console.error('Error fetching team performance metrics:', error);
      // Fallback to mock data
      return this.getMockTeamPerformanceData();
    }
  }
  
  private async fetchTeamPerformanceMetrics() {
    // In a real implementation, this would fetch from an API
    // For now, return mock data
    const metrics = [
      {
        id: "1",
        name: "John Doe",
        rep_id: "1",
        calls: 124,
        successRate: 68,
        avgSentiment: 0.78,
        conversionRate: 0.32
      },
      {
        id: "2",
        name: "Jane Smith",
        rep_id: "2",
        calls: 98,
        successRate: 72,
        avgSentiment: 0.82,
        conversionRate: 0.38
      },
      {
        id: "3",
        name: "Michael Johnson",
        rep_id: "3",
        calls: 156,
        successRate: 64,
        avgSentiment: 0.71,
        conversionRate: 0.29
      },
      {
        id: "4",
        name: "Emily Davis",
        rep_id: "4",
        calls: 112,
        successRate: 70,
        avgSentiment: 0.75,
        conversionRate: 0.34
      }
    ];
    
    // Convert the legacy format to the new TeamPerformance format
    return metrics.map(metric => ({
      rep_id: metric.rep_id || metric.id,
      rep_name: metric.name,
      call_volume: metric.calls || 0,
      avg_call_duration: 0, // Default value
      sentiment_score: metric.avgSentiment || 0.5,
      success_rate: metric.successRate || 0,
      avg_talk_ratio: 50, // Default value
      objection_handling_score: 0, // Default value
      positive_language_score: 0, // Default value
      top_keywords: [],
      last_call_date: new Date().toISOString(),
      // Keep legacy fields for backward compatibility
      id: metric.id,
      name: metric.name,
      calls: metric.calls,
      successRate: metric.successRate,
      avgSentiment: metric.avgSentiment,
      conversionRate: metric.conversionRate
    })) as TeamPerformance[];
  }
  
  getMockTeamPerformanceData(): TeamPerformance[] {
    return [
      {
        rep_id: "1",
        rep_name: "John Doe",
        call_volume: 124,
        avg_call_duration: 384,
        sentiment_score: 0.78,
        success_rate: 68,
        avg_talk_ratio: 42,
        objection_handling_score: 85,
        positive_language_score: 92,
        top_keywords: ["pricing", "features", "support"],
        last_call_date: new Date().toISOString(),
        // Legacy fields
        id: "1",
        name: "John Doe",
        calls: 124,
        successRate: 68,
        avgSentiment: 0.78,
        conversionRate: 0.32
      },
      {
        rep_id: "2",
        rep_name: "Jane Smith",
        call_volume: 98,
        avg_call_duration: 412,
        sentiment_score: 0.82,
        success_rate: 72,
        avg_talk_ratio: 38,
        objection_handling_score: 92,
        positive_language_score: 88,
        top_keywords: ["discount", "contract", "timeline"],
        last_call_date: new Date().toISOString(),
        // Legacy fields
        id: "2",
        name: "Jane Smith",
        calls: 98,
        successRate: 72,
        avgSentiment: 0.82,
        conversionRate: 0.38
      },
      {
        rep_id: "3",
        rep_name: "Michael Johnson",
        call_volume: 156,
        avg_call_duration: 356,
        sentiment_score: 0.71,
        success_rate: 64,
        avg_talk_ratio: 45,
        objection_handling_score: 78,
        positive_language_score: 85,
        top_keywords: ["competition", "features", "pricing"],
        last_call_date: new Date().toISOString(),
        // Legacy fields
        id: "3",
        name: "Michael Johnson",
        calls: 156,
        successRate: 64,
        avgSentiment: 0.71,
        conversionRate: 0.29
      },
      {
        rep_id: "4",
        rep_name: "Emily Davis",
        call_volume: 112,
        avg_call_duration: 398,
        sentiment_score: 0.75,
        success_rate: 70,
        avg_talk_ratio: 40,
        objection_handling_score: 88,
        positive_language_score: 90,
        top_keywords: ["onboarding", "support", "integration"],
        last_call_date: new Date().toISOString(),
        // Legacy fields
        id: "4",
        name: "Emily Davis",
        calls: 112,
        successRate: 70,
        avgSentiment: 0.75,
        conversionRate: 0.34
      }
    ];
  }
  
  async getTeamMemberPerformance(teamMemberId: string): Promise<TeamPerformance | null> {
    try {
      const allPerformance = await this.getTeamPerformanceMetrics();
      return allPerformance.find(p => p.rep_id === teamMemberId || p.id === teamMemberId) || null;
    } catch (error) {
      console.error(`Error fetching performance for team member ${teamMemberId}:`, error);
      return null;
    }
  }
  
  async getTopPerformers(limit: number = 3): Promise<TeamPerformance[]> {
    try {
      const allPerformance = await this.getTeamPerformanceMetrics();
      return allPerformance
        .sort((a, b) => (b.success_rate || 0) - (a.success_rate || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top performers:', error);
      return [];
    }
  }
}

export const teamMetricsService = TeamMetricsServiceClass.getInstance();
