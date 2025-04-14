
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCallMetricsStore } from '@/store/useCallMetricsStore';

const LiveMetricsDisplay = () => {
  const { 
    callScore, 
    sentiment, 
    keywords, 
    talkRatio = { agent: 50, customer: 50 },
    duration = 0
  } = useCallMetricsStore();

  const [durationDisplay, setDurationDisplay] = useState('00:00');

  useEffect(() => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    setDurationDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [duration]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium">Call Duration</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="text-2xl font-bold">{durationDisplay}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="text-2xl font-bold">
            {typeof sentiment === 'number' 
              ? `${(sentiment * 100).toFixed(0)}%` 
              : sentiment || 'Neutral'}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium">Talk Ratio</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Agent: {talkRatio.agent.toFixed(0)}%</span>
              <span>Customer: {talkRatio.customer.toFixed(0)}%</span>
            </div>
            <Progress value={talkRatio.agent} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium">Call Score</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="text-2xl font-bold">{callScore || '0'}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveMetricsDisplay;
