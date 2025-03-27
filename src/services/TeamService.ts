
import { EventsService } from './events';
import { TeamMember } from '@/types/team';
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from './ErrorHandlingService';

// Mock data for demo purposes if needed
const demoTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'manager',
    createdAt: new Date().toISOString(),
    avatar: 'https://ui-avatars.com/api/?name=John+Smith'
  },
  {
    id: '2',
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    role: 'member',
    createdAt: new Date().toISOString(),
    avatar: 'https://ui-avatars.com/api/?name=Emma+Johnson'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    role: 'member',
    createdAt: new Date().toISOString(),
    avatar: 'https://ui-avatars.com/api/?name=Michael+Brown'
  }
];

export class TeamServiceClass {
  private storageKey = 'team_members';
  
  // Get team members from database or local storage
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      // First try to get from Supabase
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) {
        console.error('Error fetching team members from database:', error);
        return this.getStoredTeamMembers();
      }
      
      if (data && data.length > 0) {
        // Convert the Supabase data to our TeamMember interface
        const teamMembers: TeamMember[] = data.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          role: item.role || 'member',
          createdAt: item.created_at,
          avatar: item.avatar
        }));
        
        // Also update local storage as fallback
        localStorage.setItem(this.storageKey, JSON.stringify(teamMembers));
        
        return teamMembers;
      }
      
      // If no data in database, return from local storage
      return this.getStoredTeamMembers();
    } catch (error) {
      console.error('Error in getTeamMembers:', error);
      errorHandler.handleError(error, 'TeamService.getTeamMembers');
      return this.getStoredTeamMembers();
    }
  }
  
  // Get team members from local storage
  getStoredTeamMembers(): TeamMember[] {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      // No stored data, return demo data
      localStorage.setItem(this.storageKey, JSON.stringify(demoTeamMembers));
      return demoTeamMembers;
    } catch (error) {
      console.error('Error getting stored team members:', error);
      return demoTeamMembers;
    }
  }
  
  // Add a team member
  async addTeamMember(member: TeamMember): Promise<TeamMember> {
    try {
      // Try to add to database first
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role || 'member',
          avatar: member.avatar
        })
        .select();
      
      if (error) {
        console.error('Error adding team member to database:', error);
        // Fall back to local storage
        return this.addTeamMemberToLocalStorage(member);
      }
      
      // Dispatch event for other components to update
      EventsService.getInstance().dispatchEvent('team-member-added', { member });
      
      return member;
    } catch (error) {
      console.error('Error in addTeamMember:', error);
      errorHandler.handleError(error, 'TeamService.addTeamMember');
      return this.addTeamMemberToLocalStorage(member);
    }
  }
  
  // Add a team member to local storage
  addTeamMemberToLocalStorage(member: TeamMember): TeamMember {
    try {
      const currentMembers = this.getStoredTeamMembers();
      const updatedMembers = [...currentMembers, member];
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedMembers));
      
      // Dispatch event for other components to update
      EventsService.getInstance().dispatchEvent('team-member-added', { member });
      
      return member;
    } catch (error) {
      console.error('Error adding team member to local storage:', error);
      throw error;
    }
  }
  
  // Remove a team member
  async removeTeamMember(memberId: string): Promise<void> {
    try {
      // Try to remove from database first
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
      
      if (error) {
        console.error('Error removing team member from database:', error);
        // Fall back to local storage
        this.removeTeamMemberFromLocalStorage(memberId);
        return;
      }
      
      // Also remove from local storage
      this.removeTeamMemberFromLocalStorage(memberId);
      
      // Dispatch event for other components to update
      EventsService.getInstance().dispatchEvent('team-member-removed', { memberId });
    } catch (error) {
      console.error('Error in removeTeamMember:', error);
      errorHandler.handleError(error, 'TeamService.removeTeamMember');
      this.removeTeamMemberFromLocalStorage(memberId);
    }
  }
  
  // Remove a team member from local storage
  removeTeamMemberFromLocalStorage(memberId: string): void {
    try {
      const currentMembers = this.getStoredTeamMembers();
      const updatedMembers = currentMembers.filter(member => member.id !== memberId);
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedMembers));
      
      // Dispatch event for other components to update
      EventsService.getInstance().dispatchEvent('team-member-removed', { memberId });
    } catch (error) {
      console.error('Error removing team member from local storage:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const TeamService = new TeamServiceClass();
