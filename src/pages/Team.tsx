
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TeamMemberCard from '@/components/Team/TeamMemberCard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { teamService } from '@/services/TeamService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const Team = () => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const { toast } = useToast();
  
  const { teamMembers, isLoading, refreshTeamMembers } = teamService.useTeamMembers();

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMemberName.trim()) {
      toast({
        title: "Error",
        description: "Member name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await teamService.addTeamMember({
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole,
        user_id: `user-${Date.now()}` // Generate a new user_id if none exists
      });
      
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
      
      // Clear form
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberRole('');
      
      // Refresh the list
      refreshTeamMembers();
      
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveMember = async (id: string) => {
    try {
      await teamService.removeTeamMember(id);
      
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
      
      // Refresh the list
      refreshTeamMembers();
      
    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Team Management</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Add Team Member</CardTitle>
              <CardDescription>Add a new member to your sales team</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="John Doe"
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
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      placeholder="Sales Rep"
                    />
                  </div>
                </div>
                <Button type="submit" className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <h2 className="text-2xl font-semibold mt-8">Team Members</h2>
          
          {isLoading ? (
            <div className="text-center py-8">Loading team members...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={{
                    id: member.id,
                    name: member.name,
                    email: member.email || '',
                    role: member.role || '',
                    avatar: member.avatar_url
                  }}
                  onDelete={() => handleRemoveMember(member.id)}
                />
              ))}
              
              {teamMembers.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No team members found. Add your first team member above.
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Team;
