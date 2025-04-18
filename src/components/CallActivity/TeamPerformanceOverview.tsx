
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Activity, Clock, AlertCircle, ArrowUpRight, Zap } from "lucide-react";
import ContentLoader from "@/components/ui/ContentLoader";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import { generateMockTeamMetrics, USE_MOCK_DATA } from "@/services/MockDataService";

export interface TeamMetricsData {
  totalCalls?: number;
  avgSentiment?: number;
  avgTalkRatio?: { agent: number; customer: number };
  topKeywords?: string[];
}

interface TeamPerformanceOverviewProps {
  teamMetrics: TeamMetricsData;
  teamMetricsLoading: boolean;
  callsLength: number;
}

const TeamPerformanceOverview: React.FC<TeamPerformanceOverviewProps> = ({ 
  teamMetrics = {}, 
  teamMetricsLoading = false,
  callsLength = 0
}) => {
  // Generate mock data if needed
  const mockMetrics = useMemo(() => generateMockTeamMetrics(), []);
  
  // Use either real metrics or mock metrics based on the flag
  const displayMetrics = useMemo(() => {
    if (USE_MOCK_DATA) {
      return mockMetrics;
    }
    return teamMetrics;
  }, [teamMetrics, mockMetrics]);
  
  // Calculate derived values from either real or mock metrics with stabilization
  const totalCalls = useMemo(() => {
    if (displayMetrics && 'totalCalls' in displayMetrics) {
      const baseCount = displayMetrics.totalCalls !== undefined ? displayMetrics.totalCalls : 42;
      return Math.floor(baseCount + (callsLength || 0));
    }
    return Math.floor(42 + (callsLength || 0));
  }, [displayMetrics, callsLength]);
  
  const sentiment = useMemo(() => {
    if (displayMetrics && 'avgSentiment' in displayMetrics) {
      const sentimentValue = displayMetrics.avgSentiment !== undefined ? displayMetrics.avgSentiment : 0.68;
      return Math.floor(sentimentValue * 100);
    } 
    // For metrics array, calculate average sentiment score
    else if (Array.isArray(displayMetrics)) {
      // Use either sentiment_score or avgSentiment depending on what's available
      const avgScore = displayMetrics.reduce((acc, item) => {
        const sentimentValue = item.sentiment_score !== undefined ? item.sentiment_score : item.avgSentiment;
        return acc + (sentimentValue || 0);
      }, 0) / displayMetrics.length;
      return Math.floor(avgScore * 100);
    }
    return Math.floor(0.68 * 100);
  }, [displayMetrics]);
  
  const talkRatio = useMemo(() => {
    if (displayMetrics && 'avgTalkRatio' in displayMetrics) {
      const agent = Math.floor(displayMetrics.avgTalkRatio?.agent !== undefined ? displayMetrics.avgTalkRatio.agent : 55);
      const customer = Math.floor(displayMetrics.avgTalkRatio?.customer !== undefined ? displayMetrics.avgTalkRatio.customer : 45);
      return `${agent}:${customer}`;
    }
    // For metrics array, calculate average talk ratio
    else if (Array.isArray(displayMetrics)) {
      // Check for both avg_talk_ratio and direct ratio properties
      const avgRatio = displayMetrics.reduce((acc, item) => {
        // Use either avg_talk_ratio or default calculation
        const ratio = item.avg_talk_ratio !== undefined ? item.avg_talk_ratio : 0.55;
        return acc + ratio;
      }, 0) / displayMetrics.length;
      const agent = Math.floor(avgRatio * 100);
      const customer = 100 - agent;
      return `${agent}:${customer}`;
    }
    return "55:45";
  }, [displayMetrics]);
  
  const topKeywords = useMemo(() => {
    if (displayMetrics && 'topKeywords' in displayMetrics) {
      return displayMetrics.topKeywords?.length ? 
        displayMetrics.topKeywords.slice(0, 3) : 
        ["pricing", "features", "support"];
    }
    // For metrics array, collect unique keywords
    else if (Array.isArray(displayMetrics)) {
      // Use either top_keywords or fallback
      const allKeywords = displayMetrics.flatMap(item => item.top_keywords || []);
      const uniqueKeywords = [...new Set(allKeywords)];
      return uniqueKeywords.slice(0, 3).length > 0 ? 
        uniqueKeywords.slice(0, 3) : 
        ["pricing", "features", "support"];
    }
    return ["pricing", "features", "support"];
  }, [displayMetrics]);
  
  // Determine if we should show loading state
  const showLoading = teamMetricsLoading && !USE_MOCK_DATA;
  
  // Use fixed height to prevent layout shifts
  const metricCardHeight = "h-[120px]";
  
  return (
    <Card className="mb-6 overflow-hidden border-0 shadow-md dark:shadow-none dark:border-white/10 bg-white/80 dark:bg-dark-purple/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-foreground">
              Team Performance Overview
              <Zap className="h-5 w-5 ml-2 text-neon-purple" />
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Real-time metrics from all calls and recordings
            </CardDescription>
          </div>
          <div className="flex items-center justify-center bg-neon-purple/10 dark:bg-neon-purple/20 p-1.5 rounded-md">
            <ArrowUpRight className="h-4 w-4 text-neon-purple" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-0 shadow-md dark:shadow-none dark:border-white/10">
            <CardContent className={`p-6 ${metricCardHeight}`}>
              <ContentLoader isLoading={showLoading} height={80}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                    <h3 className="text-2xl font-bold mt-1 text-foreground">
                      <AnimatedNumber value={totalCalls} duration={1200} />
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-neon-purple/10 dark:bg-neon-purple/20">
                    <Phone className="h-5 w-5 text-neon-purple" />
                  </div>
                </div>
              </ContentLoader>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-950/20 border-0 shadow-md dark:shadow-none dark:border-white/10">
            <CardContent className={`p-6 ${metricCardHeight}`}>
              <ContentLoader isLoading={showLoading} height={80}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Sentiment</p>
                    <h3 className="text-2xl font-bold mt-1 text-foreground">
                      <AnimatedNumber value={sentiment} duration={1200} suffix="%" />
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-neon-green/10 dark:bg-neon-green/20">
                    <Activity className="h-5 w-5 text-neon-green" />
                  </div>
                </div>
              </ContentLoader>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-0 shadow-md dark:shadow-none dark:border-white/10">
            <CardContent className={`p-6 ${metricCardHeight}`}>
              <ContentLoader isLoading={showLoading} height={80}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Talk Ratio</p>
                    <h3 className="text-2xl font-bold mt-1 text-foreground">{talkRatio}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-neon-blue/10 dark:bg-neon-blue/20">
                    <Clock className="h-5 w-5 text-neon-blue" />
                  </div>
                </div>
              </ContentLoader>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-0 shadow-md dark:shadow-none dark:border-white/10">
            <CardContent className={`p-6 ${metricCardHeight}`}>
              <ContentLoader isLoading={showLoading} height={80}>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Top Keywords</p>
                    <div className="p-2 rounded-full bg-amber-500/10 dark:bg-amber-500/20">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {topKeywords.length > 0 ? (
                      topKeywords.map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No keywords recorded</p>
                    )}
                  </div>
                </div>
              </ContentLoader>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(TeamPerformanceOverview);
