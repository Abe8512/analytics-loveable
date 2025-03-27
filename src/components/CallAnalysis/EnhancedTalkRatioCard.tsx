
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, UserSquare2, ArrowDownRight, ArrowUpRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TalkRatioMetrics } from '@/services/AdvancedMetricsService';

interface EnhancedTalkRatioCardProps {
  metrics: TalkRatioMetrics;
  isLoading?: boolean;
}

const EnhancedTalkRatioCard: React.FC<EnhancedTalkRatioCardProps> = ({ 
  metrics, 
  isLoading = false 
}) => {
  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Determine if dominance score is balanced
  const getDominanceRating = () => {
    if (metrics.dominance_score < 0.8) return { label: 'Great Balance', color: 'bg-green-500' };
    if (metrics.dominance_score < 1.5) return { label: 'Good Balance', color: 'bg-blue-500' };
    if (metrics.dominance_score < 2.5) return { label: 'Agent Dominant', color: 'bg-yellow-500' };
    return { label: 'Highly Agent Dominant', color: 'bg-red-500' };
  };
  
  const dominanceRating = getDominanceRating();
  
  // Calculate agent and prospect percentages
  const agentPercentage = Math.round(metrics.agent_ratio * 100);
  const prospectPercentage = Math.round(metrics.prospect_ratio * 100);
  
  // Get the optimal ratio target
  const getTargetRatioMet = () => {
    // Ideal ratio is when agent talks 40-60% of the time
    return agentPercentage >= 40 && agentPercentage <= 60;
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          Enhanced Talk Ratio Analysis
        </CardTitle>
        <CardDescription>
          Conversation balance and speaking patterns
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
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${dominanceRating.color} text-white`}>
                  {dominanceRating.label}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Dominance Score: {metrics.dominance_score.toFixed(2)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <UserSquare2 className="h-4 w-4 text-blue-500" />
                    Agent
                  </span>
                  <span className="text-sm">{agentPercentage}%</span>
                </div>
                <Progress value={agentPercentage} className="h-2 bg-muted" 
                          indicatorClassName="bg-blue-500" />
                <div className="text-xs text-muted-foreground">
                  {formatTime(metrics.agent_talk_time)} speaking time
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <UserSquare2 className="h-4 w-4 text-pink-500" />
                    Customer
                  </span>
                  <span className="text-sm">{prospectPercentage}%</span>
                </div>
                <Progress value={prospectPercentage} className="h-2 bg-muted" 
                          indicatorClassName="bg-pink-500" />
                <div className="text-xs text-muted-foreground">
                  {formatTime(metrics.prospect_talk_time)} speaking time
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-2 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Silence:</span>
                <span className="font-medium">{formatTime(metrics.silence_time)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {metrics.interruption_count > 2 ? (
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                )}
                <span className="text-muted-foreground">Interruptions:</span>
                <span className="font-medium">{metrics.interruption_count}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-1">Insights</h4>
              <ul className="text-sm space-y-1">
                {!getTargetRatioMet() && (
                  <li className="flex items-start gap-1 text-yellow-600">
                    <div className="w-1 h-1 rounded-full bg-yellow-600 mt-2"></div>
                    {agentPercentage > 60 
                      ? "Agent is dominating the conversation. Try to listen more."
                      : "Agent could engage more in the conversation to guide it effectively."}
                  </li>
                )}
                
                {metrics.interruption_count > 2 && (
                  <li className="flex items-start gap-1 text-yellow-600">
                    <div className="w-1 h-1 rounded-full bg-yellow-600 mt-2"></div>
                    "High number of interruptions may indicate rushed communication."
                  </li>
                )}
                
                {metrics.silence_time > 60 && (
                  <li className="flex items-start gap-1 text-blue-600">
                    <div className="w-1 h-1 rounded-full bg-blue-600 mt-2"></div>
                    "Consider reducing silence gaps to maintain engagement."
                  </li>
                )}
                
                {getTargetRatioMet() && metrics.interruption_count <= 2 && (
                  <li className="flex items-start gap-1 text-green-600">
                    <div className="w-1 h-1 rounded-full bg-green-600 mt-2"></div>
                    "Great conversational balance achieved in this call."
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTalkRatioCard;
