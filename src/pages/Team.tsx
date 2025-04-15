import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { teamService } from '@/services/TeamService';
import { useToast } from '@/hooks/use-toast';
import { TeamMembersList } from '@/components/Team/TeamMembersList';
import { TeamTranscriptActivity } from '@/components/Team/TeamTranscriptActivity';
import { useEventListener } from '@/services/events/hooks';
import { TeamMember } from '@/types/teamTypes';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'sales-rep',
  });
  
  useEffect(() => {
    fetchTeamMembers();
  }, []);
  
  useEventListener('team-member-added', () => fetchTeamMembers());
  useEventListener('team-member-removed', () => fetchTeamMembers());
  
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const members = await teamService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddTeamMember = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Name and email are required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const newMember = await teamService.addTeamMember({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        user_id: `user-${Date.now()}` // Generate a temporary ID
      });
      
      toast({
        title: 'Success',
        description: `${newMember.name} added to team`,
      });
      
      setFormData({
        name: '',
        email: '',
        role: 'sales-rep',
      });
      
      setIsModalOpen(false);
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add team member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteTeamMember = async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      await teamService.removeTeamMember(id);
      toast({
        title: 'Success',
        description: 'Team member removed',
      });
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove team member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMemberSelect = useCallback((id: string) => {
    setSelectedMemberId(id === selectedMemberId ? null : id);
  }, [selectedMemberId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Team Management</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Team Member</DialogTitle>
                <DialogDescription>
                  Create a new team member to assign calls and track performance.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales-rep">Sales Representative</SelectItem>
                      <SelectItem value="team-lead">Team Lead</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTeamMember}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Member'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <TeamMembersList
                  teamMembers={teamMembers}
                  isLoading={isLoading}
                  selectedMemberId={selectedMemberId}
                  onMemberSelect={handleMemberSelect}
                  onDeleteMember={handleDeleteTeamMember}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedMemberId 
                    ? `${teamMembers.find(m => m.id === selectedMemberId)?.name}'s Activity` 
                    : 'Team Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamTranscriptActivity memberId={selectedMemberId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Team;
