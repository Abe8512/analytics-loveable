
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CallTranscript } from '@/types/call';
import { TeamMember } from '@/types/teamTypes';
import { useTranscripts } from '@/contexts/TranscriptContext';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface TeamTranscriptActivityProps {
  teamMemberId?: string;
}

const TeamTranscriptActivity: React.FC<TeamTranscriptActivityProps> = ({ teamMemberId }) => {
  const { transcripts, isLoading } = useTranscripts();
  const { teamMembers } = useTeamMembers();
  const [teamMemberTranscripts, setTeamMemberTranscripts] = useState<CallTranscript[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const navigate = useNavigate();
  
  // Find selected team member
  useEffect(() => {
    if (teamMemberId && teamMembers) {
      const member = teamMembers.find(m => m.id === teamMemberId);
      setSelectedMember(member || null);
    } else {
      setSelectedMember(null);
    }
  }, [teamMemberId, teamMembers]);
  
  // Filter transcripts by team member
  useEffect(() => {
    if (!transcripts || !Array.isArray(transcripts)) return;
    
    if (teamMemberId) {
      const filtered = transcripts.filter(t => t.assigned_to === teamMemberId);
      setTeamMemberTranscripts(filtered);
    } else {
      // Show all transcripts if no team member selected
      setTeamMemberTranscripts(transcripts.slice(0, 5));
    }
  }, [transcripts, teamMemberId]);
  
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
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {selectedMember ? `${selectedMember.name}'s Recent Calls` : 'Team Call Activity'}
          </CardTitle>
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
        <CardTitle className="text-xl">
          {selectedMember ? `${selectedMember.name}'s Recent Calls` : 'Team Call Activity'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamMemberTranscripts.length > 0 ? (
          <div className="space-y-4">
            {teamMemberTranscripts.map(transcript => (
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
            
            {teamMemberTranscripts.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => navigate('/transcripts')}
              >
                View All Calls
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>
              {selectedMember 
                ? `No call records found for ${selectedMember.name}` 
                : 'No call records available'}
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              size="sm"
              onClick={() => navigate('/transcripts')}
            >
              Browse All Calls
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamTranscriptActivity;
