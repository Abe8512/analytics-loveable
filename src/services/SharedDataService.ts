
// SharedDataService.ts - Central service for sharing data between components

export interface TeamMetricsData {
  totalCalls: number;
  avgSentiment: number;
  avgTalkRatio: {
    agent: number;
    customer: number;
  };
  topKeywords: string[];
  performanceScore: number;
  conversionRate: number;
}

export interface RepMetricsData {
  id: string;
  name: string;
  callVolume: number;
  successRate: number;
  sentiment: number;
  insights: string[];
}

// Fetch team member data
export const getTeamMembers = async () => {
  try {
    // This would typically fetch from the database, but for now we return demo data
    return [
      { id: "1", name: "Alex Johnson", email: "alex@example.com", role: "sales" },
      { id: "2", name: "Maria Garcia", email: "maria@example.com", role: "sales" },
      { id: "3", name: "David Kim", email: "david@example.com", role: "sales" },
      { id: "4", name: "Sarah Williams", email: "sarah@example.com", role: "sales" },
      { id: "5", name: "James Taylor", email: "james@example.com", role: "sales" }
    ];
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
};

// Mock function to get managed users
export const getManagedUsers = (): Array<{id: string, name: string, email?: string, role?: string}> => {
  // This would typically fetch from the database, but for now we return demo data
  return getTeamMembers();
};

export const getTeamMetrics = (): TeamMetricsData => {
  return {
    totalCalls: 128,
    avgSentiment: 0.72,
    avgTalkRatio: { agent: 55, customer: 45 },
    topKeywords: ['pricing', 'features', 'support', 'implementation', 'integration'],
    performanceScore: 72,
    conversionRate: 45
  };
};

export const getRepMetrics = (): RepMetricsData[] => {
  return [
    {
      id: "1",
      name: "Alex Johnson",
      callVolume: 145,
      successRate: 72,
      sentiment: 0.85,
      insights: ["Excellent rapport building", "Good at overcoming objections"]
    },
    {
      id: "2",
      name: "Maria Garcia",
      callVolume: 128,
      successRate: 68,
      sentiment: 0.79,
      insights: ["Strong product knowledge", "Could improve closing"]
    },
    {
      id: "3",
      name: "David Kim",
      callVolume: 103,
      successRate: 62,
      sentiment: 0.72,
      insights: ["Good discovery questions", "Needs work on follow-up"]
    }
  ];
};
