
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Phone, User, UserCheck, Clock } from 'lucide-react';
import { teamService } from '@/services/TeamService';
import { useEventListener } from '@/services/events/hooks';

interface TeamMembersTableProps {
  selectedUserId?: string | null;
  onTeamMemberSelect?: (id: string) => void;
  limit?: number;
}

const TeamMembersTable: React.FC<TeamMembersTableProps> = ({ 
  selectedUserId, 
  onTeamMemberSelect,
  limit 
}) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const members = await teamService.getTeamMembers();
      // Apply limit if specified
      const limitedMembers = limit ? members.slice(0, limit) : members;
      setTeamMembers(limitedMembers);
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
  
  useEffect(() => {
    fetchTeamMembers();
  }, [limit]);
  
  // Listen for team member events to refresh the table
  useEventListener('team-member-added', () => {
    fetchTeamMembers();
  });
  
  useEventListener('team-member-removed', () => {
    fetchTeamMembers();
  });

  const handleRowClick = (memberId: string) => {
    if (onTeamMemberSelect) {
      onTeamMemberSelect(memberId);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple mx-auto mb-2"></div>
            <p>Loading team members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-4 text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
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
              <TableRow 
                key={member.id}
                className={`cursor-pointer ${selectedUserId === member.id ? 'bg-accent/40' : 'hover:bg-accent/20'}`}
                onClick={() => handleRowClick(member.id)}
              >
                <TableCell>
                  <Avatar>
                    <AvatarImage src={member.avatar_url || ""} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email || 'No email'}</TableCell>
                <TableCell>{member.role || 'No role'}</TableCell>
                <TableCell className="text-right">
                  {selectedUserId === member.id ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="opacity-50">
                      <User className="mr-2 h-4 w-4" />
                      Inactive
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {teamMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No team members found.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Add team members in the Team page.</p>
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
