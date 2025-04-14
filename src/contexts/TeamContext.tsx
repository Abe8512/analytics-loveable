
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { teamService } from '@/services/TeamService';
import { TeamMember, TeamMemberResponse } from '@/types/teamTypes';
import { EventsService } from '@/services/EventsService';
import { toast } from 'sonner';

interface TeamContextProps {
  teamMembers: TeamMember[];
  selectedMember: TeamMember | null;
  isLoading: boolean;
  error: Error | null;
  setSelectedMember: (member: TeamMember | null) => void;
  refreshTeamMembers: () => Promise<void>;
  addTeamMember: (member: Partial<TeamMember>) => Promise<TeamMember>;
  removeTeamMember: (id: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextProps>({
  teamMembers: [],
  selectedMember: null,
  isLoading: false,
  error: null,
  setSelectedMember: () => {},
  refreshTeamMembers: async () => {},
  addTeamMember: async () => ({} as TeamMember),
  removeTeamMember: async () => {},
});

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const { teamMembers, isLoading, error, refreshTeamMembers } = teamService.useTeamMembers();

  // Set first team member as selected if none is selected and team members are loaded
  useEffect(() => {
    if (teamMembers.length > 0 && !selectedMember) {
      setSelectedMember(teamMembers[0]);
    } else if (teamMembers.length === 0) {
      setSelectedMember(null);
    } else if (selectedMember && !teamMembers.find(m => m.id === selectedMember.id)) {
      // If selected member no longer exists, select first available
      setSelectedMember(teamMembers[0]);
    }
  }, [teamMembers, selectedMember]);

  const addTeamMember = useCallback(async (member: Partial<TeamMember>) => {
    try {
      const newMember = await teamService.addTeamMember(member);
      toast.success(`${newMember.name} added to team`);
      return newMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error adding team member';
      toast.error('Failed to add team member', { description: errorMessage });
      throw err;
    }
  }, []);

  const removeTeamMember = useCallback(async (id: string) => {
    try {
      await teamService.removeTeamMember(id);
      toast.success('Team member removed');
      
      // If the removed member was selected, clear selection
      if (selectedMember?.id === id) {
        setSelectedMember(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error removing team member';
      toast.error('Failed to remove team member', { description: errorMessage });
      throw err;
    }
  }, [selectedMember]);

  const value = {
    teamMembers,
    selectedMember,
    isLoading,
    error,
    setSelectedMember,
    refreshTeamMembers,
    addTeamMember,
    removeTeamMember
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeam = () => useContext(TeamContext);
