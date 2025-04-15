
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallTranscripts } from '@/services/CallTranscriptService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { TeamMember } from '@/types/teamTypes';
import { teamService } from '@/services/TeamService';

const CallActivityTable = () => {
  const { transcripts } = useCallTranscripts();
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await teamService.getTeamMembers();
        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const getTeamMemberName = (id?: string) => {
    if (!id) return 'Unassigned';
    const member = teamMembers.find(m => m.id === id);
    return member ? member.name : 'Unknown Rep';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getSentimentBadge = (sentiment: any) => {
    if (typeof sentiment === 'number') {
      if (sentiment > 0.6) return <Badge className="bg-green-500">Positive</Badge>;
      if (sentiment < 0.4) return <Badge className="bg-red-500">Negative</Badge>;
      return <Badge className="bg-blue-500">Neutral</Badge>;
    }
    
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-green-500">Positive</Badge>;
      case 'negative':
        return <Badge className="bg-red-500">Negative</Badge>;
      default:
        return <Badge className="bg-blue-500">Neutral</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent Call Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Call Date</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Sentiment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transcripts && transcripts.length > 0 ? (
                transcripts.map((transcript) => (
                  <TableRow key={transcript.id}>
                    <TableCell>{formatDate(transcript.created_at)}</TableCell>
                    <TableCell>{transcript.filename || 'Unnamed Recording'}</TableCell>
                    <TableCell>{formatDuration(transcript.duration)}</TableCell>
                    <TableCell>{getTeamMemberName(transcript.assigned_to)}</TableCell>
                    <TableCell>{getSentimentBadge(transcript.sentiment)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No call records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CallActivityTable;
