
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/integrations/supabase/client';
import { CallTranscript } from '@/types/call';

export interface TeamTranscriptActivityProps {
  memberId: string | null;
}

export const TeamTranscriptActivity: React.FC<TeamTranscriptActivityProps> = ({ memberId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);

  useEffect(() => {
    const fetchTranscripts = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('call_transcripts')
          .select('*')
          .order('created_at', { ascending: false });
        
        // Filter by member ID if provided
        if (memberId) {
          query = query.eq('assigned_to', memberId);
        }
        
        // Limit to 10 most recent
        query = query.limit(10);
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setTranscripts(data || []);
      } catch (error) {
        console.error('Error fetching transcripts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTranscripts();
  }, [memberId]);

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
