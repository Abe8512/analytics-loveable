import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types/teamTypes';
import { safeSupabaseOperation } from '@/integrations/supabase/errorHandling';
import { EventsService } from './EventsService';
import { EventType } from '@/services/events/types';

class TeamService {
  async getTeamMembers(): Promise<TeamMember[]> {
    return safeSupabaseOperation(
      async () => {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching team members:', error);
          throw new Error(error.message);
        }

        return data || [];
      },
      'getTeamMembers'
    );
  }

  async getTeamMemberById(id: string): Promise<TeamMember | null> {
    return safeSupabaseOperation(
      async () => {
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
      },
      'getTeamMemberById'
    );
  }

  async addTeamMember(teamMember: Omit<TeamMember, 'id' | 'created_at'>): Promise<TeamMember | null> {
    return safeSupabaseOperation(
      async () => {
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
          // Dispatch both event types
          EventsService.dispatchEvent('TEAM_MEMBER_ADDED' as EventType, { teamMember: data });
          EventsService.dispatchEvent('team-member-added' as EventType, { teamMember: data });
        }

        return data || null;
      },
      'addTeamMember'
    );
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
    return safeSupabaseOperation(
      async () => {
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

        return data || null;
      },
      'updateTeamMember'
    );
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    return safeSupabaseOperation(
      async () => {
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`Error deleting team member with ID ${id}:`, error);
          throw new Error(error.message);
        }

        // Dispatch both event types
        EventsService.dispatchEvent('TEAM_MEMBER_REMOVED' as EventType, { teamMemberId: id });
        EventsService.dispatchEvent('team-member-removed' as EventType, { teamMemberId: id });

        return true;
      },
      'deleteTeamMember'
    );
  }
}

export const teamService = new TeamService();
