
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LightbulbIcon, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface SentimentInsightsCardProps {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  loading: boolean;
  keywords?: string[];
}

const SentimentInsightsCard: React.FC<SentimentInsightsCardProps> = ({
  positive,
  neutral,
  negative,
  total,
  loading,
  keywords = []
}) => {
  // Calculate percentages
  const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;
  const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0;
  const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0;
  
  // Determine if sentiment is improving or worsening (mock logic for now)
  const sentimentTrend = positivePercent > negativePercent ? 'improving' : 'worsening';
  const trendPercent = Math.abs(positivePercent - negativePercent);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          Sentiment Insights
        </CardTitle>
        <CardDescription>
          Summary of sentiment distribution across {total} analyzed conversations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-1 text-green-500">
                  Positive <Badge variant="outline">{positive}</Badge>
                </span>
                <span className="text-sm">{positivePercent}%</span>
              </div>
              <Progress value={positivePercent} className="h-2 bg-gray-200">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${positivePercent}%` }} />
              </Progress>
              
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-1 text-blue-500">
                  Neutral <Badge variant="outline">{neutral}</Badge>
                </span>
                <span className="text-sm">{neutralPercent}%</span>
              </div>
              <Progress value={neutralPercent} className="h-2 bg-gray-200">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${neutralPercent}%` }} />
              </Progress>
              
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-1 text-red-500">
                  Negative <Badge variant="outline">{negative}</Badge>
                </span>
                <span className="text-sm">{negativePercent}%</span>
              </div>
              <Progress value={negativePercent} className="h-2 bg-gray-200">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${negativePercent}%` }} />
              </Progress>
            </div>
            
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                {sentimentTrend === 'improving' ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Sentiment Improving</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-500">Sentiment Declining</span>
                  </>
                )}
                <span className="text-xs text-muted-foreground ml-1">
                  ({trendPercent}% {sentimentTrend === 'improving' ? 'better' : 'worse'} than average)
                </span>
              </h4>
              
              {negativePercent > 30 && (
                <div className="mt-2 p-2 bg-red-50 text-red-800 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-xs">
                    High negative sentiment detected. Consider reviewing calls with keywords: 
                    {keywords.slice(0, 3).map(k => ` "${k}"`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentInsightsCard;
