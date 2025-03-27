
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CallQualityScoreProps {
  transcript?: any;
  isLoading?: boolean;
}

const CallQualityScore: React.FC<CallQualityScoreProps> = ({ transcript, isLoading = false }) => {
  // Sample quality scores
  const qualityMetrics = [
    { name: 'Discovery', score: 65 },
    { name: 'Objection Handling', score: 72 },
    { name: 'Solution Presentation', score: 84 },
    { name: 'Closing Technique', score: 58 }
  ];
  
  const qualityScore = transcript?.call_score || 70;
  
  const getQualityLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 70) return { label: 'Good', color: 'text-blue-600' };
    if (score >= 50) return { label: 'Average', color: 'text-yellow-600' };
    return { label: 'Needs Improvement', color: 'text-red-600' };
  };
  
  const scoreLabel = getQualityLabel(qualityScore);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Call Quality Score
        </CardTitle>
        <CardDescription>
          Performance evaluation metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        ) : transcript ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-1">
                {qualityScore}
              </div>
              <div className={`text-sm font-medium ${scoreLabel.color}`}>
                {scoreLabel.label}
              </div>
            </div>
            
            <div className="space-y-3">
              {qualityMetrics.map((metric, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{metric.name}</span>
                    <span className="font-medium">{metric.score}</span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No quality score available</p>
            <p className="text-sm mt-2">Upload a call recording to analyze</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CallQualityScore;
