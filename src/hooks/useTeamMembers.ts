
import { useState, useEffect, useCallback, useRef } from 'react';
import { teamService } from '@/services/TeamService';
import { TeamMember } from '@/types/teamTypes';
import { EventsService } from '@/services/EventsService';

export const useTeamMembers = (limit?: number) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  
  const fetchTeamMembers = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsLoading(true);
    
    try {
      const members = await teamService.getTeamMembers();
      
      if (mountedRef.current) {
        // Apply limit if specified
        const limitedMembers = limit ? members.slice(0, limit) : members;
        setTeamMembers(limitedMembers);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to load team members'));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [limit]);
  
  // Set up listeners for team member events
  useEffect(() => {
    // Initial load
    fetchTeamMembers();
    
    // Listen for team member events to refresh the table
    const removeTeamMemberAdded = EventsService.addEventListener('TEAM_MEMBER_ADDED', fetchTeamMembers);
    const removeTeamMemberRemoved = EventsService.addEventListener('TEAM_MEMBER_REMOVED', fetchTeamMembers);
    
    // Also listen for newer event naming convention
    const removeTeamMemberAddedHyphen = EventsService.addEventListener('team-member-added', fetchTeamMembers);
    const removeTeamMemberRemovedHyphen = EventsService.addEventListener('team-member-removed', fetchTeamMembers);
    
    // Clean up
    return () => {
      mountedRef.current = false;
      removeTeamMemberAdded();
      removeTeamMemberRemoved();
      removeTeamMemberAddedHyphen();
      removeTeamMemberRemovedHyphen();
    };
  }, [fetchTeamMembers]);
  
  return { teamMembers, isLoading, error, refreshTeamMembers: fetchTeamMembers };
};
