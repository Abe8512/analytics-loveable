
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { teamService } from '@/services/TeamService';
import { TeamMember } from '@/types/teamTypes';
import { EventsService } from '@/services/EventsService';
import { EventType } from '@/services/events/types';
import { useToast } from '@/hooks/use-toast';

interface TeamContextProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: Error | null;
  refreshTeamMembers: () => Promise<void>;
  addTeamMember: (member: TeamMember) => Promise<TeamMember | null>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<TeamMember | null>;
  deleteTeamMember: (id: string) => Promise<boolean>;
}

const TeamContext = createContext<TeamContextProps | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const refreshTeamMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const members = await teamService.getTeamMembers();
      setTeamMembers(members);
      setError(null);
    } catch (err) {
      console.error('Error refreshing team members:', err);
      setError(err instanceof Error ? err : new Error('Failed to load team members'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a team member
  const addTeamMember = async (member: TeamMember): Promise<TeamMember | null> => {
    try {
      const newMember = await teamService.addTeamMember(member);
      await refreshTeamMembers();
      toast({
        title: 'Team member added',
        description: `${newMember.name} has been added to the team`,
      });
      return newMember;
    } catch (err) {
      console.error('Error adding team member:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add team member',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update a team member
  const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
    try {
      const updatedMember = await teamService.updateTeamMember(id, updates);
      await refreshTeamMembers();
      toast({
        title: 'Team member updated',
        description: `${updatedMember?.name} has been updated`,
      });
      return updatedMember;
    } catch (err) {
      console.error(`Error updating team member with ID ${id}:`, err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update team member',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Delete a team member
  const deleteTeamMember = async (id: string): Promise<boolean> => {
    try {
      // Find the member before deleting for the toast message
      const memberToDelete = teamMembers.find(member => member.id === id);
      
      await teamService.removeTeamMember(id);
      await refreshTeamMembers();
      
      toast({
        title: 'Team member removed',
        description: memberToDelete 
          ? `${memberToDelete.name} has been removed from the team` 
          : 'Team member has been removed',
      });
      
      return true;
    } catch (err) {
      console.error(`Error deleting team member with ID ${id}:`, err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete team member',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Load team members on component mount
  useEffect(() => {
    refreshTeamMembers();
  }, [refreshTeamMembers]);

  // Listen for team member events
  useEffect(() => {
    const handleTeamMemberAdded = () => {
      refreshTeamMembers();
    };

    const handleTeamMemberRemoved = () => {
      refreshTeamMembers();
    };

    const unsubscribe1 = EventsService.addEventListener('TEAM_MEMBER_ADDED' as EventType, handleTeamMemberAdded);
    const unsubscribe2 = EventsService.addEventListener('TEAM_MEMBER_REMOVED' as EventType, handleTeamMemberRemoved);
    const unsubscribe3 = EventsService.addEventListener('team-member-added' as EventType, handleTeamMemberAdded);
    const unsubscribe4 = EventsService.addEventListener('team-member-removed' as EventType, handleTeamMemberRemoved);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  }, [refreshTeamMembers]);

  return (
    <TeamContext.Provider
      value={{
        teamMembers,
        isLoading,
        error,
        refreshTeamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
