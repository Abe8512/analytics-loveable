
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneCall, Users, UserCheck, Settings } from "lucide-react";
import ContentLoader from "@/components/ui/ContentLoader";
import { useEventListener } from "@/services/EventsService";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  callCount: number;
  performance: number;
}

interface TeamMembersTableProps {
  limit?: number;
  isLoading?: boolean;
  onTeamMemberSelect?: (id: string) => void;
}

const TeamMembersTable: React.FC<TeamMembersTableProps> = ({ 
  limit = 5, 
  isLoading = false,
  onTeamMemberSelect 
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // In a real scenario, we'd fetch this from a service
  useEffect(() => {
    // Mock data for demonstration
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Sales Rep',
        status: 'active',
        callCount: 32,
        performance: 0.87
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Team Lead',
        status: 'active',
        callCount: 27,
        performance: 0.92
      },
      {
        id: '3',
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        role: 'Sales Rep',
        status: 'inactive',
        callCount: 14,
        performance: 0.65
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        role: 'Sales Rep',
        status: 'active',
        callCount: 29,
        performance: 0.78
      },
      {
        id: '5',
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        role: 'Account Manager',
        status: 'active',
        callCount: 22,
        performance: 0.81
      }
    ];
    
    setTeamMembers(mockTeamMembers.slice(0, limit));
  }, [limit]);
  
  // Listen for team member events
  useEventListener('team-member-added', (payload) => {
    if (payload && payload.teamMember) {
      setTeamMembers(prev => {
        if (prev.length >= limit) {
          return [payload.teamMember, ...prev.slice(0, limit - 1)];
        }
        return [payload.teamMember, ...prev];
      });
    }
  });
  
  useEventListener('team-member-removed', (payload) => {
    if (payload && payload.teamMemberId) {
      setTeamMembers(prev => prev.filter(member => member.id !== payload.teamMemberId));
    }
  });
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const handleRowClick = (teamMemberId: string) => {
    if (onTeamMemberSelect) {
      onTeamMemberSelect(teamMemberId);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Members
        </CardTitle>
        <CardDescription>
          {isLoading 
            ? 'Loading team data...'
            : teamMembers.length > 0 
              ? `Showing ${teamMembers.length} team members`
              : 'No team members found'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContentLoader isLoading={isLoading} skeletonCount={3} height={200}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Calls</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <TableRow 
                    key={member.id}
                    className="cursor-pointer hover:bg-accent/20"
                    onClick={() => handleRowClick(member.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <PhoneCall className="h-3 w-3 text-muted-foreground" />
                        <span>{member.callCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              member.performance > 0.8 ? 'bg-green-500' : 
                              member.performance > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${member.performance * 100}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(member.performance * 100)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('View details for:', member.id);
                            if (onTeamMemberSelect) onTeamMemberSelect(member.id);
                          }}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Edit settings for:', member.id);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No team members found</p>
                    <p className="text-sm mt-1">Add team members to see them here</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ContentLoader>
      </CardContent>
    </Card>
  );
};

export default TeamMembersTable;
