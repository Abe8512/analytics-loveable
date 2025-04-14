
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCallMetricsStore } from '@/store/useCallMetricsStore';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, LineChart, BarChart, MessageSquare } from 'lucide-react';

interface KeyPhrase {
  text: string;
  sentiment?: number;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const getSentimentLabel = (value: number) => {
  if (value >= 0.7) return { label: 'Positive', color: 'bg-green-500' };
  if (value <= 0.3) return { label: 'Negative', color: 'bg-red-500' };
  return { label: 'Neutral', color: 'bg-blue-500' };
};

const LiveMetricsDisplay = () => {
  const { 
    duration, 
    talkRatio, 
    sentiment, 
    isTalkingMap, 
    keyPhrases,
  } = useCallMetricsStore();
  
  // Handle the customer/client property mapping (client is in the type but we use customer in the UI)
  const customerTalkRatio = talkRatio.client;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Talk Ratio Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <BarChart className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">Talk Ratio</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Agent</span>
                <span>{talkRatio.agent}%</span>
              </div>
              <Progress value={talkRatio.agent} className="h-2 bg-blue-100" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Customer</span>
                <span>{customerTalkRatio}%</span>
              </div>
              <Progress value={customerTalkRatio} className="h-2 bg-pink-100" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Call Duration Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">Call Duration</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-3xl font-bold">{formatTime(duration)}</div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sentiment Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <LineChart className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">Sentiment</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </div>
          
          <div className="space-y-3">
            <Progress value={sentiment * 100} className="h-2" />
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={`${getSentimentLabel(sentiment).color} text-white px-2 py-0.5`}
              >
                {getSentimentLabel(sentiment).label}
              </Badge>
              <span className="text-sm">{Math.round(sentiment * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Key Phrases Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">Key Phrases</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-[120px] overflow-y-auto">
            {keyPhrases.length > 0 ? (
              keyPhrases.map((phrase: KeyPhrase, index: number) => (
                <div key={index} className="text-xs p-1 bg-gray-100 dark:bg-gray-800 rounded">
                  {phrase.text}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-2">
                No key phrases detected yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveMetricsDisplay;
