
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface CallInsightsProps {
  transcript?: any;
  isLoading?: boolean;
}

const CallInsights: React.FC<CallInsightsProps> = ({ transcript, isLoading = false }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Call Insights
        </CardTitle>
        <CardDescription>
          AI-powered insights from this call
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
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI-generated insights and recommendations will appear here once the call is analyzed.
            </p>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No transcript data available</p>
            <p className="text-sm mt-2">Upload a call recording to analyze</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CallInsights;
