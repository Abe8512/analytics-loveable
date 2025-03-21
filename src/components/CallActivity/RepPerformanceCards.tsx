
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RepMetrics } from "@/services/RealTimeMetricsService";
import ContentLoader from '@/components/ui/ContentLoader';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

interface RepPerformanceCardsProps {
  repMetrics: RepMetrics[];
  repMetricsLoading: boolean;
}

const RepPerformanceCards: React.FC<RepPerformanceCardsProps> = ({ 
  repMetrics, 
  repMetricsLoading 
}) => {
  // Use stable metrics with memoization
  const stableMetrics = useMemo(() => 
    repMetrics.map(rep => ({
      ...rep,
      // Ensure all numeric values are stabilized
      callVolume: Math.floor(rep.callVolume),
      successRate: Math.floor(rep.successRate),
      sentiment: Math.floor(rep.sentiment * 100) / 100
    })), 
    [repMetrics]
  );
  
  // Pre-calculate card heights for stability
  const fixedCardHeight = "h-[380px]";
  
  return (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle>Individual Performance</CardTitle>
        <CardDescription>
          Performance metrics for individual team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContentLoader 
          isLoading={repMetricsLoading} 
          height={400} 
          skeletonCount={3} 
          preserveHeight={true}
          delay={400}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stableMetrics.length > 0 ? (
              stableMetrics.map(rep => (
                <Card key={rep.id} className={`overflow-hidden ${fixedCardHeight}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{rep.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Call Volume</span>
                        <span className="font-medium w-12 text-right">
                          <AnimatedNumber value={rep.callVolume} duration={800} />
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, rep.callVolume / 2)} 
                        className="h-1.5" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                        <span className="font-medium w-12 text-right">
                          <AnimatedNumber value={rep.successRate} duration={800} suffix="%" />
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, rep.successRate)} 
                        className="h-1.5" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Customer Sentiment</span>
                        <span className="font-medium w-12 text-right">
                          <AnimatedNumber value={rep.sentiment * 100} duration={800} suffix="%" />
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, rep.sentiment * 100)} 
                        className="h-1.5" 
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">AI Insights</h4>
                      <ul className="text-sm space-y-1">
                        {rep.insights.map((insight, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className="min-w-1.5 h-1.5 rounded-full bg-neon-purple mt-1.5 mr-2"></div>
                            {String(insight)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 flex justify-center items-center h-40">
                <p className="text-muted-foreground">No representative data available</p>
              </div>
            )}
          </div>
        </ContentLoader>
      </CardContent>
    </Card>
  );
};

export default React.memo(RepPerformanceCards);
