
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Play, Download, Clock, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CallTranscript } from '@/types/call';

interface TranscriptViewerProps {
  transcriptId: string;
  onClose: () => void;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ transcriptId, onClose }) => {
  const [transcript, setTranscript] = useState<CallTranscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('call_transcripts')
          .select('*')
          .eq('id', transcriptId)
          .single();
          
        if (error) {
          throw error;
        }
        
        setTranscript(data as CallTranscript);
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setError('Failed to load transcript');
      } finally {
        setLoading(false);
      }
    };
    
    if (transcriptId) {
      fetchTranscript();
    }
  }, [transcriptId]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !transcript) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Error</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error || 'Transcript not found'}</p>
          <Button className="mt-4" onClick={onClose}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Format timestamp to readable date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown date';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sticky top-0 z-10 bg-card">
        <CardTitle className="text-xl font-bold">Transcript Details</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">{transcript.filename}</h3>
          <p className="text-sm text-muted-foreground">{formatDate(transcript.created_at)}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant={transcript.sentiment === 'positive' ? 'default' : 
                          transcript.sentiment === 'negative' ? 'destructive' : 'secondary'}>
            {transcript.sentiment}
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {Math.floor((transcript.duration || 0) / 60)}:{((transcript.duration || 0) % 60).toString().padStart(2, '0')}
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {transcript.user_name || 'Unknown Rep'}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            Play
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-2">Call Score</h4>
          <div className="flex items-center">
            <div className="w-full bg-muted rounded-full h-2 mr-2">
              <div 
                className={`h-2 rounded-full ${
                  (transcript.call_score || 0) > 70 ? 'bg-green-500' :
                  (transcript.call_score || 0) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${transcript.call_score || 0}%` }}
              ></div>
            </div>
            <span>{transcript.call_score || 0}</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-1">
            {transcript.keywords && transcript.keywords.length > 0 ? (
              transcript.keywords.map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No keywords available</p>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-2">Transcript</h4>
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
            {transcript.text || 'No transcript text available'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptViewer;
