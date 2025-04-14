
import { useState, useEffect, useCallback, useRef } from 'react';
import { teamService } from '@/services/TeamService';
import { TeamMember } from '@/types/teamTypes';
import { EventsService } from '@/services/EventsService';
import { EventType } from '@/services/events/types';

export const useTeamMembers = (limit?: number) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const listenerIds = useRef<string[]>([]);
  
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
    const id1 = EventsService.addEventListener('TEAM_MEMBER_ADDED' as EventType, fetchTeamMembers);
    const id2 = EventsService.addEventListener('TEAM_MEMBER_REMOVED' as EventType, fetchTeamMembers);
    const id3 = EventsService.addEventListener('team-member-added' as EventType, fetchTeamMembers);
    const id4 = EventsService.addEventListener('team-member-removed' as EventType, fetchTeamMembers);
    
    // Store the listener IDs
    listenerIds.current = [id1, id2, id3, id4];
    
    // Clean up
    return () => {
      mountedRef.current = false;
      listenerIds.current.forEach(id => EventsService.removeEventListener(id));
    };
  }, [fetchTeamMembers]);
  
  return { teamMembers, isLoading, error, refreshTeamMembers: fetchTeamMembers };
};
