
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Activity, Clock, AlertCircle } from "lucide-react";
import { TeamMetrics } from "@/services/RealTimeMetricsService";
import ContentLoader from "@/components/ui/ContentLoader";

interface TeamPerformanceOverviewProps {
  teamMetrics: TeamMetrics;
  teamMetricsLoading: boolean;
  callsLength: number;
}

const TeamPerformanceOverview: React.FC<TeamPerformanceOverviewProps> = ({ 
  teamMetrics, 
  teamMetricsLoading,
  callsLength
}) => {
  // Use default values when metrics are undefined
  const totalCalls = useMemo(() => 
    Math.round((teamMetrics?.totalCalls || 0) + callsLength), 
    [teamMetrics?.totalCalls, callsLength]
  );
  
  const sentiment = useMemo(() => 
    Math.round((teamMetrics?.avgSentiment || 0) * 100), 
    [teamMetrics?.avgSentiment]
  );
  
  const talkRatio = useMemo(() => {
    const agent = Math.round(teamMetrics?.avgTalkRatio?.agent || 50);
    const customer = Math.round(teamMetrics?.avgTalkRatio?.customer || 50);
    return `${agent}:${customer}`;
  }, [teamMetrics?.avgTalkRatio?.agent, teamMetrics?.avgTalkRatio?.customer]);
  
  const topKeywords = useMemo(() => 
    teamMetrics?.topKeywords?.slice(0, 3) || ["pricing", "features", "support"], 
    [teamMetrics?.topKeywords]
  );
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle>Team Performance Overview</CardTitle>
        <CardDescription>
          Real-time metrics from all calls and recordings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-purple-50 dark:bg-purple-950/20">
            <CardContent className="p-6">
              <ContentLoader isLoading={teamMetricsLoading} height={80}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                    <h3 className="text-2xl font-bold mt-1">{totalCalls}</h3>
                  </div>
                  <Phone className="h-8 w-8 text-neon-purple opacity-80" />
                </div>
              </ContentLoader>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-6">
              <ContentLoader isLoading={teamMetricsLoading} height={80}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Sentiment</p>
                    <h3 className="text-2xl font-bold mt-1">{sentiment}%</h3>
                  </div>
                  <Activity className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </ContentLoader>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-6">
              <ContentLoader isLoading={teamMetricsLoading} height={80}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Talk Ratio</p>
                    <h3 className="text-2xl font-bold mt-1">{talkRatio}</h3>
                  </div>
                  <Clock className="h-8 w-8 text-neon-blue opacity-80" />
                </div>
              </ContentLoader>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <ContentLoader isLoading={teamMetricsLoading} height={80}>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Top Keywords</p>
                    <AlertCircle className="h-5 w-5 text-amber-500 opacity-80" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {topKeywords.length > 0 ? (
                      topKeywords.map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm">No keywords recorded</p>
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
