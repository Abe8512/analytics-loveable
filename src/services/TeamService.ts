
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types/teamTypes';
import { EventsService } from './EventsService';
import { EventType } from '@/services/events/types';

class TeamService {
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getTeamMembers:', error.message);
      throw error;
    }
  }

  async getTeamMemberById(id: string): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching team member with ID ${id}:`, error);
        throw new Error(error.message);
      }

      return data || null;
    } catch (error: any) {
      console.error(`Error in getTeamMemberById (${id}):`, error.message);
      throw error;
    }
  }

  async addTeamMember(teamMember: Partial<TeamMember>): Promise<TeamMember> {
    // Ensure the required fields are present
    if (!teamMember.name) {
      throw new Error('Team member name is required');
    }
    if (!teamMember.email) {
      throw new Error('Team member email is required');
    }
    if (!teamMember.user_id) {
      throw new Error('Team member user_id is required');
    }
    
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([teamMember])
        .select('*')
        .single();

      if (error) {
        console.error('Error adding team member:', error);
        throw new Error(error.message);
      }

      if (data) {
        // Dispatch events
        EventsService.dispatchEvent('TEAM_MEMBER_ADDED' as EventType, { teamMember: data });
        EventsService.dispatchEvent('team-member-added' as EventType, { teamMember: data });
      }

      return data as TeamMember;
    } catch (error: any) {
      console.error('Error in addTeamMember:', error.message);
      throw error;
    }
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error(`Error updating team member with ID ${id}:`, error);
        throw new Error(error.message);
      }

      return data as TeamMember || null;
    } catch (error: any) {
      console.error(`Error in updateTeamMember (${id}):`, error.message);
      throw error;
    }
  }

  async removeTeamMember(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting team member with ID ${id}:`, error);
        throw new Error(error.message);
      }

      // Dispatch events
      EventsService.dispatchEvent('TEAM_MEMBER_REMOVED' as EventType, { teamMemberId: id });
      EventsService.dispatchEvent('team-member-removed' as EventType, { teamMemberId: id });

      return true;
    } catch (error: any) {
      console.error(`Error in removeTeamMember (${id}):`, error.message);
      throw error;
    }
  }

  // Alias for useTeamMembers hook compatibility
  useTeamMembers = () => {
    return this.getTeamMembers();
  }
}

export const teamService = new TeamService();
