
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CallTranscript } from '@/types/call';
import { useTranscript } from '@/contexts/TranscriptContext';
import { formatDistanceToNow } from 'date-fns';
import { LineChart, BarChart, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const RecentTranscriptInsights: React.FC = () => {
  const { transcripts, isLoading } = useTranscript();
  const navigate = useNavigate();
  const [recentTranscripts, setRecentTranscripts] = useState<CallTranscript[]>([]);
  
  useEffect(() => {
    if (transcripts && transcripts.length > 0) {
      // Sort by date (newest first) and take the first 5
      const sorted = [...transcripts]
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
      
      setRecentTranscripts(sorted);
    }
  }, [transcripts]);
  
  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };
  
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  const handleViewTranscript = (id: string) => {
    navigate(`/transcripts?id=${id}`);
  };
  
  const handleViewAllTranscripts = () => {
    navigate('/transcripts');
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Transcripts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Recent Transcripts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTranscripts && recentTranscripts.length > 0 ? (
          <div className="space-y-4">
            {recentTranscripts.map(transcript => (
              <div 
                key={transcript.id} 
                className="p-3 border rounded-md hover:bg-accent/20 transition-colors cursor-pointer"
                onClick={() => handleViewTranscript(transcript.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium truncate">
                    {transcript.user_name || 'Unknown'} {transcript.customer_name ? `→ ${transcript.customer_name}` : ''}
                  </div>
                  <Badge className={getSentimentColor(transcript.sentiment)}>
                    {transcript.sentiment || 'neutral'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {transcript.text ? transcript.text.substring(0, 80) + '...' : 'No text available'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatTime(transcript.created_at)}</span>
                  
                  <div className="flex items-center space-x-2">
                    {transcript.duration && (
                      <span>{Math.floor(transcript.duration / 60)}:{(transcript.duration % 60).toString().padStart(2, '0')}</span>
                    )}
                    
                    {transcript.call_score !== undefined && (
                      <div className="flex items-center">
                        <span className={
                          (transcript.call_score || 0) > 70 ? 'text-green-600' :
                          (transcript.call_score || 0) > 40 ? 'text-amber-500' : 'text-red-500'
                        }>
                          {transcript.call_score}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={handleViewAllTranscripts}
            >
              View All Transcripts
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent transcripts available</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              size="sm"
              onClick={handleViewAllTranscripts}
            >
              Browse Transcripts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTranscriptInsights;
