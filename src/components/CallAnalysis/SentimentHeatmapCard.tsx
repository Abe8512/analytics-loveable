
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Info } from 'lucide-react';
import { SentimentHeatmapPoint } from '@/services/AdvancedMetricsService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SentimentHeatmapCardProps {
  heatmapData: SentimentHeatmapPoint[];
  isLoading?: boolean;
  duration: number;
}

const SentimentHeatmapCard: React.FC<SentimentHeatmapCardProps> = ({ 
  heatmapData, 
  isLoading = false,
  duration
}) => {
  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Determine width of heatmap points based on duration
  const getSegmentWidth = (point: SentimentHeatmapPoint, index: number, all: SentimentHeatmapPoint[]) => {
    if (all.length <= 1) return '100%';
    
    // Calculate width based on timeline position
    if (index === all.length - 1) {
      // For the last segment, use the remaining width
      return `${100 / all.length}%`;
    } else {
      // For middle segments, calculate based on time difference to next point
      const nextTime = all[index + 1].time;
      const currentTime = point.time;
      const timeSpan = nextTime - currentTime;
      const proportion = timeSpan / duration;
      return `${Math.max(1, proportion * 100)}%`;
    }
  };
  
  // Get color based on sentiment
  const getSentimentColor = (sentiment: string, score: number) => {
    if (sentiment === 'POSITIVE') {
      return 'bg-green-500';
    } else if (sentiment === 'NEGATIVE') {
      return 'bg-red-500';
    } else {
      return 'bg-blue-400';
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Sentiment Heatmap
        </CardTitle>
        <CardDescription>
          Emotional patterns throughout the call
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border overflow-hidden bg-muted/20">
              {heatmapData.length > 0 ? (
                <div className="flex h-14">
                  <TooltipProvider>
                    {heatmapData.map((point, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div 
                            className={`h-full hover:opacity-80 transition-opacity cursor-help ${getSentimentColor(point.label, point.score)}`}
                            style={{ 
                              width: getSegmentWidth(point, index, heatmapData),
                              opacity: Math.max(0.4, point.score)
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium">{point.label} ({Math.round(point.score * 100)}%)</p>
                            <p className="text-sm text-muted-foreground">Time: {formatTime(point.time)}</p>
                            <p className="text-sm italic">"{point.text_snippet}"</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              ) : (
                <div className="h-14 flex items-center justify-center text-muted-foreground text-sm">
                  No sentiment data available
                </div>
              )}
            </div>
            
            <div className="flex justify-between text-xs pt-1">
              <div>0:00</div>
              <div>{formatTime(duration / 4)}</div>
              <div>{formatTime(duration / 2)}</div>
              <div>{formatTime((duration / 4) * 3)}</div>
              <div>{formatTime(duration)}</div>
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span>Positive</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-blue-400"></div>
                <span>Neutral</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                <span>Negative</span>
              </div>
            </div>
            
            <div className="pt-2 border-t mt-2">
              <h4 className="text-sm font-medium mb-1">Insights</h4>
              <div className="text-sm space-y-1">
                {heatmapData.length > 0 ? (
                  <>
                    <div className="flex items-start gap-1 text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2"></div>
                      {heatmapData.filter(p => p.label === 'POSITIVE').length > heatmapData.length / 2 ? (
                        "Overall positive sentiment throughout the call"
                      ) : heatmapData.filter(p => p.label === 'NEGATIVE').length > heatmapData.length / 3 ? (
                        "Multiple negative sentiment moments detected"
                      ) : (
                        "Mixed sentiment with neutral predominance"
                      )}
                    </div>
                    {heatmapData.some(p => p.label === 'NEGATIVE' && p.score > 0.7) && (
                      <div className="flex items-start gap-1 text-yellow-600">
                        <div className="w-1 h-1 rounded-full bg-yellow-600 mt-2"></div>
                        "Strong negative moments detected - review context"
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-muted-foreground">
                    No sentiment data available to generate insights
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentHeatmapCard;
