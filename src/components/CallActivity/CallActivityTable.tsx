
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useCallTranscripts } from '@/services/CallTranscriptService';
import { Skeleton } from '@/components/ui/skeleton';
import { CallTranscript } from '@/types/call';
import { formatDistanceToNow } from 'date-fns';
import { teamService } from '@/services/TeamService';

const CallActivityTable = () => {
  const { transcripts, isLoading, error } = useCallTranscripts();
  const [callData, setCallData] = useState<CallTranscript[]>([]);
  
  useEffect(() => {
    if (transcripts) {
      setCallData(transcripts);
    }
  }, [transcripts]);
  
  const getTeamMemberName = (userId?: string): string => {
    if (!userId) return 'Unassigned';
    const teamMember = teamService.getTeamMemberById(userId);
    return teamMember?.name || 'Unknown Rep';
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Call Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground">
            Error loading call data
          </div>
        ) : callData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No call records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Call Name</TableHead>
                  <TableHead>Rep</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callData.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">{call.filename || 'Unnamed Call'}</TableCell>
                    <TableCell>{getTeamMemberName(call.assigned_to)}</TableCell>
                    <TableCell>{formatDuration(call.duration || 0)}</TableCell>
                    <TableCell>
                      {call.created_at 
                        ? formatDistanceToNow(new Date(call.created_at), { addSuffix: true }) 
                        : 'Unknown date'}
                    </TableCell>
                    <TableCell>
                      {getSentimentLabel(call.sentiment)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getSentimentLabel(sentiment: string | number | undefined): string {
  if (sentiment === undefined) return 'Unknown';
  
  if (typeof sentiment === 'number') {
    return sentiment > 0.66 ? 'Positive' : sentiment > 0.33 ? 'Neutral' : 'Negative';
  }
  
  return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
}

export default CallActivityTable;
