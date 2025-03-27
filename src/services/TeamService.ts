
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEventsStore } from './events';
import { errorHandler } from './ErrorHandlingService';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar_url?: string;
  user_id: string;
}

class TeamService {
  private teamMembersCache: TeamMember[] | null = null;
  private isTeamMembersTableMissing: boolean = false;
  private lastChecked: number = 0;
  private CHECK_INTERVAL = 600000; // 10 minutes
  
  constructor() {
    console.log('TeamService initialized');
  }
  
  async checkTeamMembersTable(): Promise<boolean> {
    // Only check if we haven't checked recently or if we previously found it missing
    const now = Date.now();
    if (!this.isTeamMembersTableMissing && now - this.lastChecked < this.CHECK_INTERVAL) {
      return !this.isTeamMembersTableMissing;
    }
    
    try {
      this.lastChecked = now;
      
      // Try to query the table to see if it exists
      const { error } = await supabase
        .from('team_members')
        .select('id')
        .limit(1);
        
      // If there's a specific error about the table not existing
      if (error && (
        error.message.includes('does not exist') || 
        error.message.includes('relation "team_members" does not exist')
      )) {
        console.log('team_members table does not exist');
        this.isTeamMembersTableMissing = true;
        return false;
      }
        
      // If we get here, the table exists
      this.isTeamMembersTableMissing = false;
      return true;
    } catch (error) {
      console.error('Error checking team_members table:', error);
      // Assume the table doesn't exist on error
      this.isTeamMembersTableMissing = true;
      return false;
    }
  }
  
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      // Check if the team_members table exists
      const tableExists = await this.checkTeamMembersTable();
      
      if (!tableExists) {
        console.log('Using local storage fallback for team members');
        return this.getStoredTeamMembers();
      }
      
      // Fetch from database
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching team members:', error);
        errorHandler.handleError(error, 'TeamService.getTeamMembers');
        
        // Fallback to local storage
        return this.getStoredTeamMembers();
      }
      
      if (data && data.length > 0) {
        // Update cache
        this.teamMembersCache = data;
        
        // Also store in local storage as backup
        localStorage.setItem('team_members', JSON.stringify(data));
        
        return data;
      }
      
      // If no data in database, try local storage
      return this.getStoredTeamMembers();
    } catch (error) {
      console.error('Exception in getTeamMembers:', error);
      return this.getStoredTeamMembers();
    }
  }
  
  getStoredTeamMembers(): TeamMember[] {
    try {
      // Try to get from cache first
      if (this.teamMembersCache) {
        return this.teamMembersCache;
      }
      
      // Try to get from local storage
      const stored = localStorage.getItem('team_members');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.teamMembersCache = parsed;
        return parsed;
      }
      
      // If nothing in local storage, create demo data
      const demoData: TeamMember[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          role: 'Sales Manager',
          user_id: 'user-1'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          role: 'Senior Sales Rep',
          user_id: 'user-2'
        },
        {
          id: '3',
          name: 'Jessica Rodriguez',
          email: 'jessica.r@example.com',
          role: 'Sales Rep',
          user_id: 'user-3'
        }
      ];
      
      // Store demo data
      localStorage.setItem('team_members', JSON.stringify(demoData));
      this.teamMembersCache = demoData;
      
      return demoData;
    } catch (error) {
      console.error('Error getting stored team members:', error);
      return [];
    }
  }
  
  async addTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
    try {
      // Generate a user_id if not provided
      if (!member.user_id) {
        member.user_id = `user-${Date.now()}`;
      }
      
      // Check if the team_members table exists
      const tableExists = await this.checkTeamMembersTable();
      
      if (tableExists) {
        // Add to database
        const { data, error } = await supabase
          .from('team_members')
          .insert({
            name: member.name,
            email: member.email,
            role: member.role,
            user_id: member.user_id
          })
          .select();
          
        if (error) {
          console.error('Error adding team member to database:', error);
          errorHandler.handleError(error, 'TeamService.addTeamMember');
          
          // Fallback to local storage
          return this.addTeamMemberToLocalStorage(member);
        }
        
        if (data && data.length > 0) {
          // Invalidate cache
          this.teamMembersCache = null;
          
          // Dispatch event
          const eventsStore = useEventsStore.getState();
          eventsStore.dispatchEvent('team-member-added', { member: data[0] });
          
          toast.success('Team member added successfully');
          return data[0];
        }
      }
      
      // Fallback to local storage
      return this.addTeamMemberToLocalStorage(member);
    } catch (error) {
      console.error('Exception in addTeamMember:', error);
      return this.addTeamMemberToLocalStorage(member);
    }
  }
  
  private addTeamMemberToLocalStorage(member: Partial<TeamMember>): TeamMember {
    try {
      // Get current members
      const members = this.getStoredTeamMembers();
      
      // Create new member with generated ID
      const newMember: TeamMember = {
        ...member as TeamMember,
        id: `local-${Date.now()}`,
        user_id: member.user_id || `user-${Date.now()}`
      };
      
      // Add to list
      const updatedMembers = [newMember, ...members];
      
      // Update local storage
      localStorage.setItem('team_members', JSON.stringify(updatedMembers));
      
      // Update cache
      this.teamMembersCache = updatedMembers;
      
      // Dispatch event
      const eventsStore = useEventsStore.getState();
      eventsStore.dispatchEvent('team-member-added', { member: newMember });
      
      toast.success('Team member added successfully (stored locally)');
      return newMember;
    } catch (error) {
      console.error('Error adding team member to local storage:', error);
      throw error;
    }
  }
  
  async removeTeamMember(id: string): Promise<void> {
    try {
      // Check if the team_members table exists
      const tableExists = await this.checkTeamMembersTable();
      
      if (tableExists && !id.startsWith('local-')) {
        // Remove from database
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Error removing team member from database:', error);
          errorHandler.handleError(error, 'TeamService.removeTeamMember');
          
          // Fallback to local storage
          this.removeTeamMemberFromLocalStorage(id);
          return;
        }
        
        // Invalidate cache
        this.teamMembersCache = null;
        
        // Also remove from local storage if it exists there
        this.removeTeamMemberFromLocalStorage(id);
        
        // Dispatch event
        const eventsStore = useEventsStore.getState();
        eventsStore.dispatchEvent('team-member-removed', { id });
        
        toast.success('Team member removed successfully');
        return;
      }
      
      // Fallback to local storage
      this.removeTeamMemberFromLocalStorage(id);
    } catch (error) {
      console.error('Exception in removeTeamMember:', error);
      this.removeTeamMemberFromLocalStorage(id);
    }
  }
  
  private removeTeamMemberFromLocalStorage(id: string): void {
    try {
      // Get current members
      const members = this.getStoredTeamMembers();
      
      // Filter out the member to remove
      const updatedMembers = members.filter(member => member.id !== id);
      
      // Update local storage
      localStorage.setItem('team_members', JSON.stringify(updatedMembers));
      
      // Update cache
      this.teamMembersCache = updatedMembers;
      
      // Dispatch event
      const eventsStore = useEventsStore.getState();
      eventsStore.dispatchEvent('team-member-removed', { id });
      
      toast.success('Team member removed successfully (from local storage)');
    } catch (error) {
      console.error('Error removing team member from local storage:', error);
      throw error;
    }
  }
  
  useTeamMembers() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    const refreshTeamMembers = useCallback(async () => {
      try {
        setIsLoading(true);
        const members = await teamService.getTeamMembers();
        setTeamMembers(members);
        setError(null);
      } catch (err) {
        console.error('Error refreshing team members:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error('Failed to load team members');
      } finally {
        setIsLoading(false);
      }
    }, []);
    
    useEffect(() => {
      refreshTeamMembers();
      
      // Set up event listeners for team member events
      const eventsStore = useEventsStore.getState();
      
      const unsubTeamMemberAdded = eventsStore.addEventListener('team-member-added', () => {
        console.log('Team member added event received');
        refreshTeamMembers();
      });
      
      const unsubTeamMemberRemoved = eventsStore.addEventListener('team-member-removed', () => {
        console.log('Team member removed event received');
        refreshTeamMembers();
      });
      
      return () => {
        if (unsubTeamMemberAdded) unsubTeamMemberAdded();
        if (unsubTeamMemberRemoved) unsubTeamMemberRemoved();
      };
    }, [refreshTeamMembers]);
    
    return { teamMembers, isLoading, error, refreshTeamMembers };
  }
}

export const teamService = new TeamService();
