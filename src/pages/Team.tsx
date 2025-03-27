
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TeamMemberCard from '@/components/Team/TeamMemberCard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { teamService } from '@/services/TeamService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';

const Team = () => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { teamMembers, isLoading, refreshTeamMembers, error } = teamService.useTeamMembers();

  const handleAddMember = useCallback(async (e: React.FormEvent) => {
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
      setIsSubmitting(true);
      
      await teamService.addTeamMember({
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole,
        user_id: uuidv4() // Generate a proper UUID for user_id
      });
      
      toast({
        title: "Success",
        description: `${newMemberName} added to the team`,
      });
      
      // Clear form
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberRole('');
      
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [newMemberName, newMemberEmail, newMemberRole, toast]);
  
  const handleRemoveMember = useCallback(async (id: string) => {
    try {
      await teamService.removeTeamMember(id);
      toast({
        title: "Success",
        description: "Team member removed",
      });
    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Team Management</h1>
            <Button 
              variant="outline" 
              onClick={refreshTeamMembers} 
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-neon-purple mr-2"></div>
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md">
              <p className="font-semibold">Error loading team members</p>
              <p className="text-sm">{error.message}</p>
              <p className="text-sm mt-2">Try refreshing or check your connection.</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple"></div>
                <p className="text-muted-foreground">Loading team members...</p>
              </div>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Add Team Member</CardTitle>
                  <CardDescription>Add a new member to your sales team</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
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
                    <Button 
                      type="submit" 
                      className="flex items-center"
                      disabled={isSubmitting || !newMemberName.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Member
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Team Members</h2>
                <Badge variant="outline" className="px-2 py-1">
                  {teamMembers.length} {teamMembers.length === 1 ? 'Member' : 'Members'}
                </Badge>
              </div>
              
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
                  <div className="col-span-full text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                    <p className="mb-2">No team members found.</p>
                    <p>Add your first team member above.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Team;
