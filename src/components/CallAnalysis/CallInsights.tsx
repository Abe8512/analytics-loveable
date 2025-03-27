
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, BarChart, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

interface CallInsightsProps {
  transcript?: any;
  isLoading?: boolean;
}

const CallInsights: React.FC<CallInsightsProps> = ({ transcript, isLoading = false }) => {
  // Sample insights
  const insights = [
    {
      type: 'positive',
      text: 'Great job building rapport in the first 2 minutes of the call',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    {
      type: 'improvement',
      text: 'Consider asking more open-ended questions during discovery',
      icon: <PlusCircle className="h-4 w-4 text-amber-500" />
    },
    {
      type: 'negative',
      text: 'The prospect objected to pricing without a clear resolution',
      icon: <XCircle className="h-4 w-4 text-red-500" />
    },
    {
      type: 'positive',
      text: 'Effective explanation of product benefits using customer terminology',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    }
  ];

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
            {insights.map((insight, index) => (
              <div key={index} className="flex gap-2 p-2 rounded-md bg-muted/50">
                <div className="mt-0.5">{insight.icon}</div>
                <div className="text-sm">{insight.text}</div>
              </div>
            ))}
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
