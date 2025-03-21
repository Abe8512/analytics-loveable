
import { TeamMetrics } from "./RealTimeMetricsService";

// Mock KPI data generation with enhanced sales metrics
export const generateMockKPIData = (): {
  performanceScore: number;
  totalCalls: number;
  conversionRate: number;
  callsChange: number;
  performanceChange: number;
  conversionChange: number;
  avgTalkRatio: { agent: number; customer: number };
  objectionHandlingScore: number;
  discoveryQuestionsRate: number;
  closingTechniquesScore: number;
  followUpCommitmentRate: number;
  clientEngagementScore: number;
  silencePercentage: number;
  painPointIdentificationScore: number;
} => {
  return {
    performanceScore: Math.floor(Math.random() * 25) + 65, // 65-90
    totalCalls: Math.floor(Math.random() * 50) + 100, // 100-150
    conversionRate: Math.floor(Math.random() * 20) + 25, // 25-45
    callsChange: Math.floor(Math.random() * 10) + 1, // 1-10
    performanceChange: Math.floor(Math.random() * 15) + 1, // 1-15
    conversionChange: Math.floor(Math.random() * 12) + 2, // 2-14
    avgTalkRatio: {
      agent: Math.floor(Math.random() * 20) + 45, // 45-65
      customer: Math.floor(Math.random() * 20) + 35, // 35-55
    },
    objectionHandlingScore: Math.floor(Math.random() * 30) + 65, // 65-95
    discoveryQuestionsRate: Math.floor(Math.random() * 25) + 5, // 5-30 questions per hour
    closingTechniquesScore: Math.floor(Math.random() * 25) + 60, // 60-85
    followUpCommitmentRate: Math.floor(Math.random() * 40) + 50, // 50-90%
    clientEngagementScore: Math.floor(Math.random() * 30) + 60, // 60-90
    silencePercentage: Math.floor(Math.random() * 15) + 5, // 5-20%
    painPointIdentificationScore: Math.floor(Math.random() * 25) + 65, // 65-90
  };
};

// Extended mock team metrics data
export const generateMockTeamMetrics = (): TeamMetrics => {
  return {
    totalCalls: Math.floor(Math.random() * 250) + 150, // 150-400
    avgSentiment: Math.random() * 0.3 + 0.6, // 0.6-0.9
    avgTalkRatio: {
      agent: Math.floor(Math.random() * 20) + 45, // 45-65
      customer: Math.floor(Math.random() * 20) + 35, // 35-55
    },
    topKeywords: [
      "pricing",
      "features",
      "implementation",
      "timeline",
      "support",
      "competitors",
      "budget",
      "decision",
      "concerns",
      "integration"
    ].sort(() => Math.random() - 0.5).slice(0, 5),
    performanceScore: Math.floor(Math.random() * 25) + 60, // 60-85
    conversionRate: Math.floor(Math.random() * 15) + 30, // 30-45
  };
};

// Enhanced chart data generation
export const generateMockChartData = () => {
  // Performance data for the line chart
  const performanceData = [
    { name: "Mon", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Tue", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Wed", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Thu", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Fri", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Sat", score: Math.floor(Math.random() * 15) + 65 },
    { name: "Sun", score: Math.floor(Math.random() * 15) + 65 }
  ];
  
  // Call volume data for the bar chart
  const callVolumeData = [
    { name: "Mon", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Tue", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Wed", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Thu", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Fri", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Sat", calls: Math.floor(Math.random() * 10) + 5 },
    { name: "Sun", calls: Math.floor(Math.random() * 10) + 5 }
  ];
  
  // Conversion rate data for the area chart
  const conversionData = [
    { name: "Mon", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Tue", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Wed", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Thu", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Fri", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Sat", rate: Math.floor(Math.random() * 15) + 20 },
    { name: "Sun", rate: Math.floor(Math.random() * 15) + 20 }
  ];
  
  // Talk ratio data
  const talkRatioData = [
    { name: "Mon", agent: 55, customer: 45 },
    { name: "Tue", agent: 60, customer: 40 },
    { name: "Wed", agent: 52, customer: 48 },
    { name: "Thu", agent: 48, customer: 52 },
    { name: "Fri", agent: 45, customer: 55 },
    { name: "Sat", agent: 58, customer: 42 },
    { name: "Sun", agent: 50, customer: 50 }
  ];
  
  // Objection handling data
  const objectionHandlingData = [
    { name: "Mon", score: Math.floor(Math.random() * 15) + 70 },
    { name: "Tue", score: Math.floor(Math.random() * 15) + 70 },
    { name: "Wed", score: Math.floor(Math.random() * 15) + 70 },
    { name: "Thu", score: Math.floor(Math.random() * 15) + 70 },
    { name: "Fri", score: Math.floor(Math.random() * 15) + 70 },
    { name: "Sat", score: Math.floor(Math.random() * 15) + 70 },
    { name: "Sun", score: Math.floor(Math.random() * 15) + 70 }
  ];
  
  // Question frequency data
  const questionFrequencyData = [
    { name: "Discovery", value: Math.floor(Math.random() * 30) + 20 },
    { name: "Pain Points", value: Math.floor(Math.random() * 20) + 15 },
    { name: "Budget", value: Math.floor(Math.random() * 15) + 10 },
    { name: "Timeline", value: Math.floor(Math.random() * 15) + 5 },
    { name: "Decision", value: Math.floor(Math.random() * 10) + 5 }
  ];
  
  // Keyword occurrence data for radar chart
  const keywordOccurrenceData = [
    { subject: 'Pricing', A: Math.floor(Math.random() * 50) + 50, fullMark: 100 },
    { subject: 'Features', A: Math.floor(Math.random() * 50) + 50, fullMark: 100 },
    { subject: 'Competitors', A: Math.floor(Math.random() * 50) + 30, fullMark: 100 },
    { subject: 'Implementation', A: Math.floor(Math.random() * 50) + 40, fullMark: 100 },
    { subject: 'Support', A: Math.floor(Math.random() * 50) + 45, fullMark: 100 },
    { subject: 'ROI', A: Math.floor(Math.random() * 50) + 35, fullMark: 100 },
  ];
  
  // Silence distribution data
  const silenceDistributionData = [
    { name: "0-5s", value: Math.floor(Math.random() * 30) + 40 },
    { name: "5-10s", value: Math.floor(Math.random() * 20) + 20 },
    { name: "10-15s", value: Math.floor(Math.random() * 15) + 10 },
    { name: "15-20s", value: Math.floor(Math.random() * 10) + 5 },
    { name: "20s+", value: Math.floor(Math.random() * 5) + 2 }
  ];
  
  return {
    performanceData,
    callVolumeData,
    conversionData,
    talkRatioData,
    objectionHandlingData,
    questionFrequencyData,
    keywordOccurrenceData,
    silenceDistributionData
  };
};

// Generate mock call transcript keywords based on sales methodology
export const generateMockSalesKeywords = () => {
  const discoverySets = [
    ["tell me about", "how do you currently", "what challenges", "walk me through", "describe your process"],
    ["pain points", "frustrations", "issues", "challenges", "problems"],
    ["goals", "objectives", "targets", "outcomes", "results"],
    ["timeline", "deadline", "schedule", "roadmap", "timeframe"],
    ["budget", "investment", "cost", "pricing", "spending"]
  ];
  
  const objectionSets = [
    ["too expensive", "over budget", "can't afford", "high price", "costly"],
    ["need to think", "not ready", "need more time", "too soon", "premature"],
    ["need to discuss", "talk to team", "check with", "get approval", "run by"],
    ["competitors", "other options", "alternatives", "shopping around", "comparing"]
  ];
  
  const closingSets = [
    ["next steps", "move forward", "proceed with", "get started", "implementation"],
    ["contract", "agreement", "proposal", "paperwork", "sign"],
    ["timeline", "schedule", "start date", "kickoff", "onboarding"],
    ["discount", "special offer", "promotion", "deal", "package"]
  ];
  
  // Select random keywords from each category
  const discoveryKeywords = discoverySets.map(set => set[Math.floor(Math.random() * set.length)]);
  const objectionKeywords = objectionSets.map(set => set[Math.floor(Math.random() * set.length)]);
  const closingKeywords = closingSets.map(set => set[Math.floor(Math.random() * set.length)]);
  
  return {
    discovery: discoveryKeywords,
    objections: objectionKeywords,
    closing: closingKeywords
  };
};

// Sales funnel data
export const generateMockSalesFunnelData = () => {
  const totalProspects = Math.floor(Math.random() * 500) + 500;
  const qualifiedLeads = Math.floor(totalProspects * (Math.random() * 0.3 + 0.5)); // 50-80% of prospects
  const opportunities = Math.floor(qualifiedLeads * (Math.random() * 0.3 + 0.4)); // 40-70% of qualified leads
  const proposals = Math.floor(opportunities * (Math.random() * 0.3 + 0.4)); // 40-70% of opportunities
  const closedDeals = Math.floor(proposals * (Math.random() * 0.2 + 0.3)); // 30-50% of proposals
  
  return [
    { name: "Prospects", value: totalProspects },
    { name: "Qualified Leads", value: qualifiedLeads },
    { name: "Opportunities", value: opportunities },
    { name: "Proposals", value: proposals },
    { name: "Closed Deals", value: closedDeals }
  ];
};

// Use this flag to control whether to use mock data or real data
export const USE_MOCK_DATA = true;
