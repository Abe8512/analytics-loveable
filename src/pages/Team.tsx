
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamMember } from '@/types/team';
import { TeamService } from '@/services/TeamService';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EventType } from "@/services/events/types";
import { useEventListener } from '@/services/events/hooks';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      const members = await TeamService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Listen for team member updates from other components
  useEventListener('team-member-added' as EventType, loadTeamMembers);
  useEventListener('team-member-removed' as EventType, loadTeamMembers);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both name and email for the new team member.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsAdding(true);
      await TeamService.addTeamMember({
        id: crypto.randomUUID(),
        name: newMemberName,
        email: newMemberEmail,
        role: 'member',
        createdAt: new Date().toISOString()
      });
      
      setNewMemberName('');
      setNewMemberEmail('');
      toast({
        title: 'Team Member Added',
        description: `${newMemberName} has been added to the team.`
      });
      
      // Refresh the list
      loadTeamMembers();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add team member.',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    try {
      await TeamService.removeTeamMember(member.id);
      toast({
        title: 'Team Member Removed',
        description: `${member.name} has been removed from the team.`
      });
      
      // Refresh the list
      loadTeamMembers();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove team member.',
        variant: 'destructive'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Team Management</h1>
          <Button onClick={() => setIsAdding(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>
        
        {isAdding && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? 'Adding...' : 'Add Member'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <p>No team members found.</p>
              <p className="mt-2">Click the "Add Team Member" button to add someone to your team.</p>
            </div>
          ) : (
            teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="mt-2">
                        <span className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full">
                          {member.role || 'Member'}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveMember(member)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Team;
