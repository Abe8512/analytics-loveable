
// Update imports and fix the missing properties access
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, RefreshCw } from 'lucide-react';
import { useCallMetricsStore } from '@/store/useCallMetricsStore';
import LiveMetricsDisplay from '@/components/CallAnalysis/LiveMetricsDisplay';
import CoachingAlerts from '@/components/CallAnalysis/CoachingAlerts';

const LiveCallAnalysis = () => {
  const {
    isRecording,
    setIsRecording,
    talkRatio,
    sentiment,
    duration,
    callScore,
    keywords
  } = useCallMetricsStore();
  
  const [demoIntervalId, setDemoIntervalId] = useState<number | null>(null);
  
  const startMockRecording = () => {
    if (demoIntervalId) {
      clearInterval(demoIntervalId);
    }
    
    // Set recording state
    setIsRecording(true);
    
    // Simulate recording metrics with a demo interval
    const intervalId = window.setInterval(() => {
      // Update metrics with simulated data
      useCallMetricsStore.setState(state => ({
        ...state,
        duration: state.duration + 1,
        talkRatio: {
          agent: Math.min(100, Math.max(30, state.talkRatio.agent + (Math.random() > 0.5 ? 1 : -1))),
          customer: Math.min(100, Math.max(30, state.talkRatio.customer + (Math.random() > 0.5 ? 1 : -1))),
        },
        sentiment: Math.min(1, Math.max(0, state.sentiment as number || 0.5 + (Math.random() - 0.5) * 0.05)),
        callScore: Math.min(100, Math.max(0, state.callScore + (Math.random() > 0.7 ? 1 : -1))),
        isTalkingMap: {
          agent: Math.random() > 0.7,
          customer: Math.random() > 0.8
        },
        keywords: [...(state.keywords || []), ...(Math.random() > 0.9 ? ['pricing', 'features', 'support'] : [])]
      }));
    }, 1000);
    
    setDemoIntervalId(intervalId);
  };
  
  const stopMockRecording = () => {
    if (demoIntervalId) {
      clearInterval(demoIntervalId);
      setDemoIntervalId(null);
    }
    
    // Set recording state
    setIsRecording(false);
    
    // Add to history
    useCallMetricsStore.getState().addCallToHistory({
      id: `call-${Date.now()}`,
      date: new Date().toISOString(),
      duration: useCallMetricsStore.getState().duration,
      sentiment: useCallMetricsStore.getState().sentiment,
      talkRatio: useCallMetricsStore.getState().talkRatio,
      keyPhrases: useCallMetricsStore.getState().keywords?.map(k => ({ text: k }))
    });
  };
  
  useEffect(() => {
    return () => {
      if (demoIntervalId) {
        clearInterval(demoIntervalId);
      }
    };
  }, [demoIntervalId]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Live Call Analysis</h2>
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button 
              className="flex items-center gap-2" 
              onClick={startMockRecording}
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <Button 
              variant="destructive"
              className="flex items-center gap-2" 
              onClick={stopMockRecording}
            >
              <StopCircle className="h-4 w-4" />
              Stop Recording
            </Button>
          )}
        </div>
      </div>
      
      <LiveMetricsDisplay />
      
      <CoachingAlerts />
    </div>
  );
};

export default LiveCallAnalysis;
