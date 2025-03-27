
import { supabase } from '@/integrations/supabase/client';
import { TeamPerformance } from '@/types/analytics';

export interface AnalyticsData {
  totalCalls: number;
  avgDuration: number;
  positiveSentiment: number;
  negativeSentiment: number;
  neutralSentiment: number;
  callsPerDay: { date: string; value: number }[];
  pipelineData: { name: string; value: number }[];
  conversionData: { date: string; value: number }[];
  revenueData: { date: string; value: number }[];
  productMixData: { name: string; value: number }[];
}

interface TeamMetricResult {
  teamMemberId: string;
  teamMemberName: string;
  callCount: number;
  successRate: number;
  avgSentiment: string;
}

interface RepMetricResult {
  repId: string;
  repName: string;
  callVolume: number;
  successRate: number;
  sentimentScore: number;
  topKeywords?: string[];
  insights?: string[];
}

/**
 * Fetch team metrics data from the database
 */
export const getTeamMetrics = async (): Promise<TeamMetricResult[]> => {
  try {
    // Try to fetch from the team_members table first
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('id, name, email');
    
    if (teamMembersError) {
      console.error('Error fetching team members:', teamMembersError);
      throw new Error('Failed to fetch team members data');
    }
    
    // If we have team members, try to find metrics for each one
    if (teamMembers && teamMembers.length > 0) {
      // Try to fetch from rep_metrics_summary table
      const { data: repMetrics, error: repMetricsError } = await supabase
        .from('rep_metrics_summary')
        .select('*');
      
      if (repMetricsError) {
        console.error('Error fetching rep metrics:', repMetricsError);
      }
      
      // Combine team members with rep metrics
      const combinedData: TeamMetricResult[] = teamMembers.map(member => {
        // Find metrics for this team member if available
        const metrics = repMetrics?.find(m => m.rep_id === member.id);
        
        return {
          teamMemberId: member.id,
          teamMemberName: member.name,
          callCount: metrics?.call_volume || Math.floor(Math.random() * 100),
          successRate: metrics?.success_rate || Math.floor(Math.random() * 100),
          avgSentiment: (metrics?.sentiment_score || Math.random()).toString()
        };
      });
      
      return combinedData;
    }
    
    // Fallback to mock data if no team members found
    return getMockTeamMetrics();
  } catch (error) {
    console.error('Error in getTeamMetrics:', error);
    return getMockTeamMetrics();
  }
};

/**
 * Get metrics for a specific team member
 */
export const getRepMetrics = async (repId: string): Promise<RepMetricResult | null> => {
  try {
    const { data, error } = await supabase
      .from('rep_metrics_summary')
      .select('*')
      .eq('rep_id', repId)
      .single();
    
    if (error) {
      console.error('Error fetching rep metrics:', error);
      return getMockRepMetrics(repId);
    }
    
    if (data) {
      return {
        repId: data.rep_id,
        repName: data.rep_name || 'Unknown',
        callVolume: data.call_volume || 0,
        successRate: data.success_rate || 0,
        sentimentScore: data.sentiment_score || 0.5,
        topKeywords: data.top_keywords || [],
        insights: data.insights || []
      };
    }
    
    return getMockRepMetrics(repId);
  } catch (error) {
    console.error('Error in getRepMetrics:', error);
    return getMockRepMetrics(repId);
  }
};

// Mock data functions for fallback
const getMockTeamMetrics = (): TeamMetricResult[] => {
  return [
    {
      teamMemberId: '1',
      teamMemberName: 'John Doe',
      callCount: 87,
      successRate: 68,
      avgSentiment: '0.72'
    },
    {
      teamMemberId: '2',
      teamMemberName: 'Jane Smith',
      callCount: 64,
      successRate: 75,
      avgSentiment: '0.81'
    },
    {
      teamMemberId: '3',
      teamMemberName: 'Mike Johnson',
      callCount: 92,
      successRate: 62,
      avgSentiment: '0.65'
    },
    {
      teamMemberId: '4',
      teamMemberName: 'Sarah Williams',
      callCount: 53,
      successRate: 71,
      avgSentiment: '0.78'
    }
  ];
};

const getMockRepMetrics = (repId: string): RepMetricResult => {
  return {
    repId,
    repName: 'Team Member',
    callVolume: 75,
    successRate: 68,
    sentimentScore: 0.72,
    topKeywords: ['product', 'pricing', 'features', 'competition', 'delivery'],
    insights: [
      'Performs well in product demonstrations',
      'Could improve follow-up frequency',
      'Strong in handling objections'
    ]
  };
};
