
import React, { useEffect, useState } from 'react';
import { useTranscripts } from '@/contexts/TranscriptContext';
import { CallTranscript, SentimentType } from '@/types/call';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface RecentTranscriptInsightsProps {
  limit?: number;
}

const RecentTranscriptInsights: React.FC<RecentTranscriptInsightsProps> = ({ limit = 3 }) => {
  const { transcripts, isLoading, error } = useTranscripts();
  const [recentTranscripts, setRecentTranscripts] = useState<CallTranscript[]>([]);
  
  useEffect(() => {
    if (transcripts && transcripts.length > 0) {
      const sortedTranscripts = [...transcripts].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      
      setRecentTranscripts(sortedTranscripts.slice(0, limit));
    }
  }, [transcripts, limit]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transcripts</CardTitle>
          <CardDescription>Loading recent call transcripts...</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transcripts</CardTitle>
          <CardDescription>Failed to load recent call transcripts</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Error: {error}</p>
        </CardContent>
      </Card>
    );
  }
  
  const getSentimentBadge = (sentiment: any) => {
    if (sentiment === undefined || sentiment === null) return null;
    
    let sentimentText: string;
    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
    
    // Handle different sentiment formats
    let sentimentValue: SentimentType | number;
    
    if (typeof sentiment === 'string') {
      // String can be 'positive', 'negative', 'neutral'
      sentimentValue = sentiment as SentimentType;
    } else if (typeof sentiment === 'number') {
      // Number is a score from 0 to 1
      sentimentValue = sentiment > 0.66 ? 'positive' : sentiment > 0.33 ? 'neutral' : 'negative';
    } else if (sentiment && typeof sentiment === 'object' && 'agent' in sentiment) {
      // It's a SentimentScore object with agent/customer properties
      sentimentValue = sentiment.agent > 0.66 ? 'positive' : sentiment.agent > 0.33 ? 'neutral' : 'negative';
    } else {
      return null; // Unknown format
    }
    
    if (sentimentValue === 'positive') {
      sentimentText = 'Positive';
      badgeVariant = 'default';
    } else if (sentimentValue === 'negative') {
      sentimentText = 'Negative';
      badgeVariant = 'destructive';
    } else {
      sentimentText = 'Neutral';
      badgeVariant = 'secondary';
    }
    
    return <Badge variant={badgeVariant}>{sentimentText}</Badge>;
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Recent Transcripts</CardTitle>
            <CardDescription>Latest call recordings and insights</CardDescription>
          </div>
          <Link to="/call-activity">
            <Button size="sm" variant="outline">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recentTranscripts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No recent transcripts available.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentTranscripts.map((transcript) => (
              <li key={transcript.id} className="p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{transcript.filename || 'Unknown Call'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {transcript.created_at ? new Date(transcript.created_at).toLocaleDateString() : 'Unknown Date'}
                    </p>
                  </div>
                  {getSentimentBadge(transcript.sentiment)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTranscriptInsights;
