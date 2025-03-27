
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MessageSquare, Clock } from 'lucide-react';
import { SentimentHeatmapPoint } from '@/services/AdvancedMetricsService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SentimentHeatmapCardProps {
  heatmapData: SentimentHeatmapPoint[];
  isLoading?: boolean;
  duration?: number;
}

const SentimentHeatmapCard: React.FC<SentimentHeatmapCardProps> = ({ 
  heatmapData, 
  isLoading = false,
  duration = 0 
}) => {
  const [selectedPoint, setSelectedPoint] = useState<SentimentHeatmapPoint | null>(null);
  
  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get color based on sentiment
  const getSentimentColor = (label: string, score: number) => {
    if (label === 'POSITIVE') return `rgba(34, 197, 94, ${score})`;
    if (label === 'NEGATIVE') return `rgba(239, 68, 68, ${score})`;
    return `rgba(168, 162, 158, ${score})`;
  };
  
  // Get the timeline marks based on the call duration
  const getTimelineMarks = () => {
    if (duration <= 0) return [];
    
    const marks = [];
    const interval = Math.ceil(duration / 6); // Divide timeline into ~6 segments
    
    for (let i = 0; i <= duration; i += interval) {
      marks.push(
        <div key={i} className="absolute text-xs text-muted-foreground" 
             style={{ left: `${(i / duration) * 100}%`, transform: 'translateX(-50%)' }}>
          {formatTime(i)}
        </div>
      );
    }
    
    return marks;
  };
  
  // Get trends from the heatmap data
  const getTrends = () => {
    if (heatmapData.length === 0) return [];
    
    // Split the call into beginning, middle, and end
    const beginData = heatmapData.slice(0, Math.ceil(heatmapData.length / 3));
    const midData = heatmapData.slice(Math.ceil(heatmapData.length / 3), Math.ceil(2 * heatmapData.length / 3));
    const endData = heatmapData.slice(Math.ceil(2 * heatmapData.length / 3));
    
    // Calculate averages for each section
    const getAvgSentiment = (data: SentimentHeatmapPoint[]) => {
      if (data.length === 0) return 0.5;
      
      const sum = data.reduce((acc, point) => {
        // Convert sentiment to numeric score
        let score = point.score;
        if (point.label === 'NEGATIVE') score = 1 - score;
        return acc + score;
      }, 0);
      
      return sum / data.length;
    };
    
    const beginSentiment = getAvgSentiment(beginData);
    const midSentiment = getAvgSentiment(midData);
    const endSentiment = getAvgSentiment(endData);
    
    const trends = [];
    
    // Overall trend
    if (endSentiment > beginSentiment + 0.1) {
      trends.push("Call sentiment improved throughout the conversation");
    } else if (beginSentiment > endSentiment + 0.1) {
      trends.push("Call sentiment declined toward the end");
    }
    
    // Middle section analysis
    if (midSentiment < beginSentiment - 0.1 && midSentiment < endSentiment - 0.1) {
      trends.push("Sentiment dipped in the middle of the call - possible objection phase");
    }
    
    // Find significant sentiment shifts
    let lastLabel = '';
    let shiftCount = 0;
    
    heatmapData.forEach(point => {
      if (lastLabel !== '' && lastLabel !== point.label) {
        shiftCount++;
      }
      lastLabel = point.label;
    });
    
    if (shiftCount >= 3) {
      trends.push(`${shiftCount} significant sentiment shifts detected`);
    }
    
    // If no specific trends, add a general insight
    if (trends.length === 0) {
      const avgSentiment = getAvgSentiment(heatmapData);
      if (avgSentiment > 0.7) {
        trends.push("Consistently positive sentiment throughout the call");
      } else if (avgSentiment < 0.4) {
        trends.push("Predominantly negative sentiment across the conversation");
      } else {
        trends.push("Mixed sentiment patterns with no strong trend");
      }
    }
    
    return trends;
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Sentiment Timeline
        </CardTitle>
        <CardDescription>
          Conversation sentiment patterns over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        ) : heatmapData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No conversation data available for sentiment analysis</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="pt-6 relative">
              {/* Timeline marks */}
              <div className="absolute bottom-[-20px] w-full flex justify-between text-xs">
                {getTimelineMarks()}
              </div>
              
              {/* Sentiment point visualizations */}
              <div className="h-12 w-full bg-muted/30 rounded-md relative">
                {heatmapData.map((point, index) => {
                  const position = duration > 0 
                    ? (point.time / duration) * 100 
                    : (index / heatmapData.length) * 100;
                    
                  return (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="absolute w-3 h-3 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-1 transition-all"
                            style={{ 
                              left: `${position}%`, 
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              backgroundColor: getSentimentColor(point.label, point.score),
                              zIndex: selectedPoint === point ? 10 : 1,
                              boxShadow: selectedPoint === point ? '0 0 0 2px white' : 'none'
                            }}
                            onClick={() => setSelectedPoint(point === selectedPoint ? null : point)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs p-1">
                            <div className="font-medium">{point.label}</div>
                            <div>{formatTime(point.time)}</div>
                            <div className="max-w-52 truncate">{point.text_snippet}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
            
            <div className="pt-6">
              {selectedPoint ? (
                <div className="border rounded-md p-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {selectedPoint.label} 
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({Math.round(selectedPoint.score * 100)}%)
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {formatTime(selectedPoint.time)}
                    </span>
                  </div>
                  <p className="text-sm">{selectedPoint.text_snippet}</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium">Sentiment Insights</h4>
                  <ul className="text-sm space-y-1">
                    {getTrends().map((trend, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <div className="w-1 h-1 rounded-full bg-primary mt-2"></div>
                        <span>{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentHeatmapCard;
