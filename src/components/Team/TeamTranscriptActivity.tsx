import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CallTranscript, safeCallTranscriptCast } from '@/types/call';
import { TeamTranscriptActivityProps } from '@/types/teamTypes';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

const TeamTranscriptActivity: React.FC<TeamTranscriptActivityProps> = ({ memberId }) => {
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTranscripts = async () => {
      if (!memberId) {
        setTranscripts([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('call_transcripts')
          .select('*')
          .eq('assigned_to', memberId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          throw error;
        }

        const safeTranscripts = data.map(item => safeCallTranscriptCast(item));
        setTranscripts(safeTranscripts);
      } catch (error) {
        console.error('Error fetching team member transcripts:', error);
        toast({
          title: "Error",
          description: "Failed to load team member transcripts",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscripts();
  }, [memberId, toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transcript activity available</p>
        <p className="text-sm mt-2">
          {memberId ? "This team member hasn't been assigned any calls yet." : "Your team doesn't have any call activity yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transcripts.map((transcript) => (
        <Card key={transcript.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div>
              <h3 className="font-medium">{transcript.filename || 'Untitled Recording'}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {transcript.text?.substring(0, 120)}...
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-muted-foreground">
                <span>Duration: {formatDuration(transcript.duration || 0)}</span>
                <span>
                  {new Date(transcript.created_at || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default TeamTranscriptActivity;
