import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useCallMetricsStore } from '@/store/useCallMetricsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Mic, BarChart2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventListener } from '@/services/events/hooks';
import { EventType } from '@/services/events/types';

interface CallHistory {
  id: string;
  date: string;
  duration: number;
  sentiment?: any;
  talkRatio?: { agent: number; customer: number };
  keyPhrases?: any[];
}

const PastCallsList = () => {
  const { callHistory, loadPastCalls } = useCallMetricsStore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Listen for events that should trigger a refresh
  useEventListener('transcript-created' as EventType, () => {
    console.log('New transcript created, refreshing past calls...');
    handleRefresh();
  });
  
  useEventListener('bulk-upload-completed' as EventType, () => {
    console.log('Bulk upload completed, refreshing past calls...');
    handleRefresh();
  });
  
  useEventListener('transcripts-refreshed' as EventType, () => {
    console.log('Transcripts refreshed, updating past calls...');
    handleRefresh();
  });
  
  // Add a manual event listener for the DOM event
  useEffect(() => {
    const handleBulkUploadCompleted = () => {
      console.log('DOM event bulk-upload-completed received, refreshing past calls');
      handleRefresh();
    };
    
    window.addEventListener('bulk-upload-completed', handleBulkUploadCompleted);
    
    return () => {
      window.removeEventListener('bulk-upload-completed', handleBulkUploadCompleted);
    };
  }, []);
  
  const handleRefresh = () => {
    setRefreshing(true);
    try {
      console.log('Manually refreshing past calls list');
      loadPastCalls(); 
    } catch (error) {
      console.error("Error refreshing calls:", error);
    }
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  useEffect(() => {
    try {
      loadPastCalls();
    } catch (error) {
      console.error("Error loading past calls:", error);
    }
  }, [loadPastCalls]);
  
  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString || "Unknown date";
    }
  };
  
  // Calculate average sentiment score
  const getAverageSentiment = (sentimentObj: any) => {
    if (!sentimentObj) return 0.5;
    
    if (typeof sentimentObj === 'number') {
      return sentimentObj;
    }
    
    if (typeof sentimentObj === 'object' && 'agent' in sentimentObj && 'customer' in sentimentObj) {
      return (sentimentObj.agent + sentimentObj.customer) / 2;
    }
    
    return 0.5; // Default middle value
  };
  
  // Get sentiment color
  const getSentimentColor = (score: number) => {
    if (score > 0.66) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (score > 0.33) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };
  
  // Check if the call ID indicates an anonymous call
  const isAnonymousCall = (id: string) => {
    return id && (id.startsWith('anonymous-') || id.startsWith('demo-') || id.startsWith('call-'));
  };
  
  // Add debug output to check what data we're getting
  useEffect(() => {
    console.log('PastCallsList - Current call history:', callHistory);
  }, [callHistory]);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Past Calls</CardTitle>
            <CardDescription>
              Recent call recordings and metrics
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!callHistory || callHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No past calls recorded yet.</p>
            <p className="text-sm mt-2">Start recording a call to see data here.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {callHistory.map((call) => {
                const talkRatio = call.talkRatio || { agent: 50, customer: 50 };
                const keyPhrases = call.keyPhrases || [];
                
                return (
                  <Card key={call.id} className="bg-muted/40">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {isAnonymousCall(call.id) 
                              ? 'Anonymous Call' 
                              : `Call ${typeof call.id === 'string' ? call.id.substring(0, 8) : call.id}`}
                          </h4>
                          <p className="text-sm text-muted-foreground">{formatDate(call.date)}</p>
                        </div>
                        {call.sentiment && (
                          <Badge className={getSentimentColor(getAverageSentiment(call.sentiment))}>
                            {getAverageSentiment(call.sentiment) > 0.66 ? 'Positive' : 
                             getAverageSentiment(call.sentiment) > 0.33 ? 'Neutral' : 'Negative'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            Duration: {formatDuration(call.duration)}
                          </span>
                        </div>
                        
                        {talkRatio && (
                          <div className="flex items-center">
                            <Mic className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">
                              Talk ratio: {Math.round(talkRatio.agent)}% / {Math.round(talkRatio.customer)}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {keyPhrases && keyPhrases.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-1">Key Phrases</h5>
                          <div className="flex flex-wrap gap-1">
                            {keyPhrases.slice(0, 3).map((phrase, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {phrase.text}
                              </Badge>
                            ))}
                            {keyPhrases.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{keyPhrases.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default PastCallsList;
