
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TranscriptViewerProps {
  transcriptId?: string;
  transcript?: any;
  error?: any;
  onClose?: () => void;
}

const TranscriptViewer = ({ transcriptId, transcript: initialTranscript, error: initialError, onClose }: TranscriptViewerProps) => {
  const [loading, setLoading] = useState<boolean>(!!transcriptId && !initialTranscript);
  const [transcript, setTranscript] = useState<any>(initialTranscript);
  const [error, setError] = useState<any>(initialError);

  useEffect(() => {
    if (transcriptId && !initialTranscript) {
      fetchTranscript(transcriptId);
    }
  }, [transcriptId, initialTranscript]);

  const fetchTranscript = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      setTranscript(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transcript:', err);
      setError(err);
      setTranscript(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transcript Details</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transcript Details</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error.toString()}
          </div>
        ) : transcript ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Date</div>
                <div>{new Date(transcript.created_at).toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Duration</div>
                <div>{transcript.duration ? `${Math.floor(transcript.duration / 60)}:${(transcript.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Sentiment</div>
                <div className="capitalize">{transcript.sentiment || 'Unknown'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Score</div>
                <div>{transcript.call_score || 'N/A'}</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Transcript Content</div>
              <div className="p-4 bg-muted/50 rounded-md max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                {transcript.text || 'No transcript content available'}
              </div>
            </div>
          </div>
        ) : (
          <div>No transcript selected</div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptViewer;
