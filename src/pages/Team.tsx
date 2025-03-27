import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, User, Mail, Briefcase, RefreshCw, Trash2 } from "lucide-react";
import { v4 } from 'uuid';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { EventsService, EventTypes } from '@/services/EventsService';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton";

// Define a custom TeamMember type to match the database structure
interface TeamMemberDB {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  user_id: string;
  member_id: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  calls: number;
  successRate: number;
  avgSentiment: string;
  conversionRate: number;
}

const getStoredTeamMembers = (): TeamMember[] => {
  try {
    const stored = localStorage.getItem('teamMembers');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error retrieving team members from localStorage:", error);
    return [];
  }
};

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<TeamMember>({
    id: '',
    name: '',
    email: '',
    role: 'Member',
    avatar: '',
    calls: 0,
    successRate: 0,
    avgSentiment: '0.0',
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // In the useEffect hook where team members are fetched
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      try {
        // First try to fetch from Supabase
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Map the database structure to the UI component structure
          const mappedTeamMembers = data.map((member: TeamMemberDB): TeamMember => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role || 'Member',
            avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
            calls: Math.floor(Math.random() * 100),
            successRate: Math.floor(Math.random() * 100),
            avgSentiment: (Math.random() * 100).toFixed(1),
            conversionRate: Math.floor(Math.random() * 100)
          }));
          
          setTeamMembers(mappedTeamMembers);
        } else {
          // Fallback to localStorage if no DB data
          const storedTeamMembers = getStoredTeamMembers();
          setTeamMembers(storedTeamMembers);
        }
      } catch (err) {
        console.error("Error fetching team members:", err);
        // Fallback to localStorage if error
        const storedTeamMembers = getStoredTeamMembers();
        setTeamMembers(storedTeamMembers);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  // Update the addTeamMember function to handle the new schema
  const addTeamMember = async (member: TeamMember) => {
    try {
      // Convert UI team member to DB format
      const newTeamMember = {
        id: v4(), // generate a new UUID
        name: member.name,
        email: member.email,
        role: member.role || 'Member',
        avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
        user_id: v4(), // generate a user_id 
        member_id: v4(), // generate a member_id
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insert into database
      const { error } = await supabase
        .from('team_members')
        .insert(newTeamMember);
        
      if (error) {
        throw error;
      }
      
      // Optimistically update UI
      const updatedMember = {
        ...member,
        id: newTeamMember.id,
        calls: 0,
        successRate: 0,
        avgSentiment: "0.0",
        conversionRate: 0
      };
      
      setTeamMembers([...teamMembers, updatedMember]);
      
      // Notify other components through the EventsService
      EventsService.dispatch(EventTypes.TEAM_MEMBER_ADDED, updatedMember);
      
      toast.success(`${member.name} added to team!`);
    } catch (err) {
      console.error("Error adding team member:", err);
      toast.error(`Failed to add ${member.name}. Please try again.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTeamMember(newMember);
    setNewMember({
      id: '',
      name: '',
      email: '',
      role: 'Member',
      avatar: '',
      calls: 0,
      successRate: 0,
      avgSentiment: '0.0',
      conversionRate: 0,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTeamMembers(teamMembers.filter(member => member.id !== id));
      toast.success('Team member deleted successfully!');
    } catch (err) {
      console.error("Error deleting team member:", err);
      toast.error('Failed to delete team member. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4">Team Management</h1>
      <p className="text-muted-foreground mb-6">
        Add, manage, and view your team members.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Team Member Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={newMember.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={newMember.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  type="text"
                  id="role"
                  name="role"
                  value={newMember.role}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableCaption>A list of your team members.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Team;
