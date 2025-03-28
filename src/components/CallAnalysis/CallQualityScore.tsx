
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, BarChart, ArrowRight, RefreshCcw } from 'lucide-react';

interface CallQualityScoreProps {
  transcript: any;
  onReanalyze: () => void;
  isAnalyzing?: boolean;
}

const CallQualityScore: React.FC<CallQualityScoreProps> = ({ 
  transcript, 
  onReanalyze,
  isAnalyzing = false
}) => {
  const callScore = transcript?.call_score || 0;
  
  // Determine score category
  const getScoreCategory = () => {
    if (callScore >= 80) return { label: 'Excellent', color: 'text-green-500' };
    if (callScore >= 60) return { label: 'Good', color: 'text-emerald-500' };
    if (callScore >= 40) return { label: 'Average', color: 'text-yellow-500' };
    if (callScore >= 20) return { label: 'Below Average', color: 'text-amber-500' };
    return { label: 'Poor', color: 'text-red-500' };
  };
  
  const scoreCategory = getScoreCategory();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Call Quality Score</CardTitle>
          <CardDescription>AI-powered evaluation of call performance</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-1"
        >
          <RefreshCcw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Reanalyze'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 border-8 border-muted rounded-full"></div>
            <div 
              className="absolute inset-0 border-8 rounded-full border-transparent"
              style={{
                borderLeftColor: 'rgb(34 197 94)', // Tailwind green-500
                borderTopColor: 'rgb(34 197 94)',
                transform: `rotate(${callScore * 1.8}deg)`,
                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            ></div>
            <div className="text-center">
              <div className="text-5xl font-bold">{callScore}</div>
              <div className={`text-sm font-medium ${scoreCategory.color}`}>{scoreCategory.label}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex items-center gap-2 border rounded-md p-3">
              <BarChart className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Talking Points</div>
                <div className="text-lg font-bold">{transcript?.keywords_hit || 0}/10</div>
              </div>
            </div>
            <div className="flex items-center gap-2 border rounded-md p-3">
              <LineChart className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Engagement</div>
                <div className="text-lg font-bold">{transcript?.engagement_score || 0}/10</div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="w-full">
            View Detailed Analysis <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallQualityScore;
