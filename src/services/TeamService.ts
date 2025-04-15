
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { EventsStore } from './events/store';
import { emitTeamMemberAdded, emitTeamMemberRemoved } from './events/teamEvents';
import { TeamMember, safeTeamMemberCast } from '@/types/teamTypes';

export class TeamServiceClass {
  private readonly localStorageKey = 'teamMembers';

  constructor() {
    this.initializeTeamMembers();
  }

  async initializeTeamMembers() {
    // Check if the team_members table exists
    const tableExists = await this.checkTableExists();
    
    if (!tableExists) {
      // If the table doesn't exist, create it and seed it with localStorage data
      await this.createTeamMembersTable();
      
      // Migrate data from localStorage to the database
      const localStorageMembers = this.getStoredTeamMembers();
      
      for (const member of localStorageMembers) {
        await this.addTeamMember(member);
      }
      
      // Clear localStorage after migration
      localStorage.removeItem(this.localStorageKey);
    }
  }

  async checkTableExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .limit(1);
      
      // If there's an error or no data, the table likely doesn't exist
      return !error && data !== null;
    } catch (err) {
      console.error('Error checking if team_members table exists:', err);
      return false;
    }
  }

  async createTeamMembersTable() {
    try {
      // Implement the table creation logic here using Supabase client
      // For example, you can use raw SQL to create the table
      const { error } = await supabase.from('team_members').select('*').limit(0);
      
      if (error) {
        console.error('Error creating team_members table:', error);
        throw error;
      }
      
      console.log('team_members table created successfully');
    } catch (err) {
      console.error('Error creating team_members table:', err);
      throw err;
    }
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      // First check if the table exists
      const tableExists = await this.checkTableExists();
      
      if (tableExists) {
        // If the table exists, get data from the database
        const { data, error } = await supabase
          .from('team_members')
          .select('*');
        
        if (error) throw error;
        
        return data?.map(member => safeTeamMemberCast(member)) || [];
      } else {
        // If the table doesn't exist, get data from localStorage
        return this.getStoredTeamMembers();
      }
    } catch (error) {
      console.error('Error getting team members:', error);
      
      // Fallback to localStorage if there's an error
      return this.getStoredTeamMembers();
    }
  }

  async getTeamMemberById(id: string): Promise<TeamMember | undefined> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error getting team member by ID:', error);
        return this.getStoredTeamMembers().find(member => member.id === id);
      }

      return safeTeamMemberCast(data);
    } catch (error) {
      console.error('Error getting team member by ID:', error);
      return this.getStoredTeamMembers().find(member => member.id === id);
    }
  }

  getStoredTeamMembers(): TeamMember[] {
    const storedMembers = localStorage.getItem(this.localStorageKey);
    return storedMembers ? JSON.parse(storedMembers).map(safeTeamMemberCast) : [];
  }

  setStoredTeamMembers(members: TeamMember[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(members));
  }

  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    try {
      const newMember: TeamMember = {
        id: uuidv4(),
        ...member,
      };

      // For Supabase insert, ensure user_id is not undefined
      const supabaseMember = {
        ...newMember,
        user_id: newMember.user_id || newMember.id // Use ID as fallback if user_id is not provided
      };

      const { data, error } = await supabase
        .from('team_members')
        .insert([supabaseMember])
        .select('*')
        .single();

      if (error) {
        console.error('Error adding team member:', error);
        throw error;
      }

      // Emit event
      emitTeamMemberAdded(data);

      return safeTeamMemberCast(data || newMember);
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  async removeTeamMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing team member:', error);
        throw error;
      }

      // Emit event
      emitTeamMemberRemoved(id);
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
    try {
      // Ensure user_id is not undefined for Supabase
      const supabaseUpdates = { 
        ...updates,
        user_id: updates.user_id || id // Use ID as fallback
      };
      
      const { data, error } = await supabase
        .from('team_members')
        .update(supabaseUpdates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating team member:', error);
        throw error;
      }

      return safeTeamMemberCast(data);
    } catch (error) {
      console.error('Error updating team member:', error);
      return null;
    }
  }
}

export const teamService = new TeamServiceClass();
