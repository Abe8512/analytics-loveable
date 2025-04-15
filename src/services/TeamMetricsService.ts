import { supabase } from '@/integrations/supabase/client';

// Define a proper TeamPerformance interface that matches the expected structure
interface TeamPerformanceDraft {
  id: string;
  name: string;
  rep_id: string;
  calls: number;
  successRate: number;
  avgSentiment: number;
  conversionRate: number;
}

interface TeamPerformance {
  id: string;
  name: string;
  rep_id: string;
  calls: number;
  successRate: number;
  avgSentiment: number;
  conversionRate: number;
}

export class TeamMetricsServiceClass {
  private teamPerformanceKey = 'teamPerformance';

  getStoredTeamPerformance(): TeamPerformance[] {
    const storedPerformance = localStorage.getItem(this.teamPerformanceKey);
    return storedPerformance ? JSON.parse(storedPerformance) : [];
  }

  setStoredTeamPerformance(performance: TeamPerformance[]) {
    localStorage.setItem(this.teamPerformanceKey, JSON.stringify(performance));
  }

  async getTeamPerformanceMetrics(): Promise<TeamPerformanceDraft[]> {
    // Use casting to return the simpler TeamPerformanceDraft type for now
    try {
      // Simulate fetching data from API or database
      return [
        {
          id: '1',
          name: 'John Smith',
          rep_id: 'rep-1',
          calls: 45,
          successRate: 0.68,
          avgSentiment: 0.72,
          conversionRate: 0.25
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          rep_id: 'rep-2',
          calls: 38,
          successRate: 0.75,
          avgSentiment: 0.81,
          conversionRate: 0.32
        },
        {
          id: '3',
          name: 'Michael Chen',
          rep_id: 'rep-3',
          calls: 52,
          successRate: 0.58,
          avgSentiment: 0.65,
          conversionRate: 0.21
        },
        {
          id: '4',
          name: 'Emma Davis',
          rep_id: 'rep-4',
          calls: 29,
          successRate: 0.83,
          avgSentiment: 0.88,
          conversionRate: 0.38
        }
      ] as TeamPerformanceDraft[];
    } catch (error) {
      console.error('Error getting team performance metrics:', error);
      return [];
    }
  }

  async getRepPerformanceMetrics(repId: string): Promise<TeamPerformance | null> {
    try {
      // Simulate fetching data from API or database
      const teamPerformanceData = this.generateRepPerformanceData();
      const repPerformance = teamPerformanceData.find(rep => rep.rep_id === repId);

      return repPerformance || null;
    } catch (error) {
      console.error('Error getting rep performance metrics:', error);
      return null;
    }
  }

  // Function to generate individual rep performance data
  generateRepPerformanceData(): TeamPerformanceDraft[] {
    return [
      {
        id: '1',
        name: 'John Smith',
        rep_id: 'rep-1',
        calls: 45,
        successRate: 0.68,
        avgSentiment: 0.72,
        conversionRate: 0.25
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        rep_id: 'rep-2',
        calls: 38,
        successRate: 0.75,
        avgSentiment: 0.81,
        conversionRate: 0.32
      },
      {
        id: '3',
        name: 'Michael Chen',
        rep_id: 'rep-3',
        calls: 52,
        successRate: 0.58,
        avgSentiment: 0.65,
        conversionRate: 0.21
      },
      {
        id: '4',
        name: 'Emma Davis',
        rep_id: 'rep-4',
        calls: 29,
        successRate: 0.83,
        avgSentiment: 0.88,
        conversionRate: 0.38
      }
    ] as TeamPerformanceDraft[];
  }

  async syncTeamPerformanceWithDatabase(): Promise<boolean> {
    try {
      // Simulate fetching data from API or database
      const teamPerformanceData = this.generateRepPerformanceData();

      // Store in local storage
      this.setStoredTeamPerformance(teamPerformanceData as TeamPerformance[]);

      return true;
    } catch (error) {
      console.error('Error syncing team performance with database:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const teamMetricsService = new TeamMetricsServiceClass();
