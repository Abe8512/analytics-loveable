import { TeamMember } from '@/types/teamTypes';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { EventsStore } from './events/store';
import { EVENT_TYPES } from './events/types';

export type { TeamMember };

class TeamServiceClass {
  private demoTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'sales-rep',
      user_id: 'user-1'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'team-lead',
      user_id: 'user-2'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      role: 'sales-rep',
      user_id: 'user-3'
    }
  ];
  
  // Cache for team members
  private teamMembersCache: TeamMember[] | null = null;
  
  async isTeamMembersTableMissing(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .select('id')
        .limit(1);
        
      return !!error;
    } catch (error) {
      console.error('Error checking team_members table:', error);
      return true;
    }
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    // Return cached data if available
    if (this.teamMembersCache) {
      return this.teamMembersCache;
    }
    
    try {
      // First, try to get from database
      const isTableMissing = await this.isTeamMembersTableMissing();
      
      if (!isTableMissing) {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          this.teamMembersCache = data;
          return data;
        }
      }
      
      // If table missing or no data, try local storage
      const storedMembers = this.getStoredTeamMembers();
      if (storedMembers && storedMembers.length > 0) {
        this.teamMembersCache = storedMembers;
        return storedMembers;
      }
      
      // If nothing in local storage, return demo data
      this.saveStoredTeamMembers(this.demoTeamMembers);
      this.teamMembersCache = this.demoTeamMembers;
      return this.demoTeamMembers;
    } catch (error) {
      console.error('Error fetching team members:', error);
      
      // Fallback to local storage
      const storedMembers = this.getStoredTeamMembers();
      if (storedMembers && storedMembers.length > 0) {
        this.teamMembersCache = storedMembers;
        return storedMembers;
      }
      
      // Last resort: return demo data
      this.teamMembersCache = this.demoTeamMembers;
      return this.demoTeamMembers;
    }
  }
  
  // Get team members from local storage
  getStoredTeamMembers(): TeamMember[] | null {
    try {
      const storedData = localStorage.getItem('team_members');
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error retrieving team members from local storage:', error);
      return null;
    }
  }
  
  // Save team members to local storage
  saveStoredTeamMembers(members: TeamMember[]): void {
    try {
      localStorage.setItem('team_members', JSON.stringify(members));
    } catch (error) {
      console.error('Error saving team members to local storage:', error);
    }
  }
  
  // Add a team member
  async addTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
    try {
      // Generate ID if not provided
      const newMember: TeamMember = {
        id: member.id || uuidv4(),
        name: member.name || 'New Team Member',
        email: member.email || 'email@example.com',
        role: member.role || 'sales-rep',
        user_id: member.user_id || `user-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      // Try to add to database first
      const isTableMissing = await this.isTeamMembersTableMissing();
      
      if (!isTableMissing) {
        const { data, error } = await supabase
          .from('team_members')
          .insert(newMember)
          .select()
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Update cache
          this.teamMembersCache = null; // Force refresh on next get
          
          // Dispatch event
          EventsStore.dispatchEvent(EVENT_TYPES.TEAM_MEMBER_ADDED, { teamMember: data });
          
          return data;
        }
      }
      
      // If database fails, add to local storage
      const storedMembers = this.getStoredTeamMembers() || [];
      const updatedMembers = [...storedMembers, newMember];
      this.saveStoredTeamMembers(updatedMembers);
      
      // Update cache
      this.teamMembersCache = updatedMembers;
      
      // Dispatch event
      EventsStore.dispatchEvent(EVENT_TYPES.TEAM_MEMBER_ADDED, { teamMember: newMember });
      
      return newMember;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }
  
  // Remove a team member
  async removeTeamMember(id: string): Promise<void> {
    try {
      // Try database first
      const isTableMissing = await this.isTeamMembersTableMissing();
      
      if (!isTableMissing) {
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Also remove from local storage
      const storedMembers = this.getStoredTeamMembers();
      if (storedMembers) {
        const updatedMembers = storedMembers.filter(member => member.id !== id);
        this.saveStoredTeamMembers(updatedMembers);
        
        // Update cache
        this.teamMembersCache = updatedMembers;
      }
      
      // Dispatch event
      EventsStore.dispatchEvent(EVENT_TYPES.TEAM_MEMBER_REMOVED, { teamMemberId: id });
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  // Clear the cache
  clearCache(): void {
    this.teamMembersCache = null;
  }
  
  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    try {
      // Try to update in Supabase if the table exists
      if (!await this.isTeamMembersTableMissing()) {
        const { data, error } = await supabase
          .from('team_members')
          .update(updates)
          .eq('id', id)
          .select('*')
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Also update in local storage
          this.updateLocalTeamMember(id, updates);
          
          // Dispatch event for updated team member
          EventsStore.dispatchEvent(EVENT_TYPES.TEAM_MEMBER_ADDED, {
            teamMember: data
          });
          
          return data as TeamMember;
        }
      }
      
      // Fall back to local storage update
      return this.updateLocalTeamMember(id, updates);
    } catch (error) {
      console.error('Error updating team member:', error);
      
      // Always fall back to local storage
      return this.updateLocalTeamMember(id, updates);
    }
  }
  
  private updateLocalTeamMember(id: string, updates: Partial<TeamMember>): TeamMember {
    const teamMembers = this.getLocalStorageTeamMembers();
    const teamMemberIndex = teamMembers.findIndex(member => member.id === id);
    
    if (teamMemberIndex === -1) {
      throw new Error(`Team member with ID ${id} not found`);
    }
    
    // Update the team member
    const updatedMember = {
      ...teamMembers[teamMemberIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    teamMembers[teamMemberIndex] = updatedMember;
    
    // Save updated list to localStorage
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    
    // Dispatch event
    EventsStore.dispatchEvent(EVENT_TYPES.TEAM_MEMBER_ADDED, {
      teamMember: updatedMember
    });
    
    return updatedMember;
  }
}

export const teamService = new TeamServiceClass();
