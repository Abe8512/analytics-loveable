import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Phone, User, UserCheck, Clock } from 'lucide-react';
import { teamService } from '@/services/TeamService';
import { useEventListener } from '@/services/events/hooks';
import { EVENT_TYPES } from '@/services/EventsService';

interface CallActivityProps {
  selectedUserId: string | null;
}

const TeamMembersTable: React.FC<CallActivityProps> = ({ selectedUserId }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      try {
        const members = await teamService.getTeamMembers();
        setTeamMembers(members);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load team members');
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, []);
  
  useEventListener(EVENT_TYPES.TEAM_MEMBER_ADDED, () => {
    fetchTeamMembers();
  });
  
  useEventListener(EVENT_TYPES.TEAM_MEMBER_REMOVED, () => {
    fetchTeamMembers();
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading team members...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={member.avatar_url || ""} alt={member.name} />
                    <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell className="text-right">
                  {selectedUserId === member.id ? (
                    <Badge variant="outline">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="opacity-50">
                      <User className="mr-2 h-4 w-4" />
                      Inactive
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {teamMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No team members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TeamMembersTable;
