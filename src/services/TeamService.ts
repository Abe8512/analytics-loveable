
import { supabase } from '@/integrations/supabase/client';

// Define types for team member data
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  user_id?: string;
  avatar?: string;
}

/**
 * Service for managing team members
 */
export class TeamService {
  /**
   * Get all team members from the database or fallback storage
   */
  public async getTeamMembers(): Promise<TeamMember[]> {
    try {
      // Try to fetch from the database first
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) {
        console.error("Error fetching team members from database:", error);
        return this.getStoredTeamMembers();
      }
      
      if (!data || data.length === 0) {
        console.log("No team members found in database, using local storage");
        return this.getStoredTeamMembers();
      }
      
      // Transform to consistent team member format
      const teamMembers = data.map(tm => ({
        id: tm.id || tm.user_id || `team-${tm.name}`,
        name: tm.name,
        email: tm.email,
        role: tm.role || 'Sales Rep',
        user_id: tm.user_id,
        avatar: tm.avatar
      }));
      
      // Store in session for quick access
      sessionStorage.setItem('managedUsers', JSON.stringify(teamMembers));
      
      return teamMembers;
    } catch (err) {
      console.error("Exception fetching team members:", err);
      return this.getStoredTeamMembers();
    }
  }
  
  /**
   * Get team members from local storage or provide demo data
   */
  private getStoredTeamMembers(): TeamMember[] {
    // Check localStorage first
    const storedData = localStorage.getItem('teamMembers');
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error('Error parsing team members from localStorage:', e);
      }
    }
    
    // Check sessionStorage next
    const sessionData = sessionStorage.getItem('managedUsers');
    if (sessionData) {
      try {
        return JSON.parse(sessionData);
      } catch (e) {
        console.error('Error parsing team members from sessionStorage:', e);
      }
    }
    
    // Return demo data as last resort
    const demoData = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Sales Rep' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Sales Rep' }
    ];
    
    // Store demo data for future use
    localStorage.setItem('teamMembers', JSON.stringify(demoData));
    sessionStorage.setItem('managedUsers', JSON.stringify(demoData));
    
    return demoData;
  }
  
  /**
   * Add a team member
   */
  public async addTeamMember(teamMember: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    try {
      const newTeamMember = {
        ...teamMember,
        id: crypto.randomUUID()
      };
      
      // Try to add to the database first
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          id: newTeamMember.id,
          name: newTeamMember.name,
          email: newTeamMember.email,
          role: newTeamMember.role,
          user_id: newTeamMember.user_id,
          avatar: newTeamMember.avatar
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding team member to database:", error);
        // Fall back to local storage
        const storedTeamMembers = this.getStoredTeamMembers();
        const updatedTeamMembers = [...storedTeamMembers, newTeamMember];
        localStorage.setItem('teamMembers', JSON.stringify(updatedTeamMembers));
        sessionStorage.setItem('managedUsers', JSON.stringify(updatedTeamMembers));
      } else if (data) {
        // Update session storage with the new team member from database
        const storedTeamMembers = await this.getTeamMembers();
        sessionStorage.setItem('managedUsers', JSON.stringify(storedTeamMembers));
        return data as TeamMember;
      }
      
      return newTeamMember;
    } catch (err) {
      console.error("Exception adding team member:", err);
      throw err;
    }
  }
  
  /**
   * Remove a team member
   */
  public async removeTeamMember(teamMemberId: string): Promise<void> {
    try {
      // Try to remove from the database first
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', teamMemberId);
      
      if (error) {
        console.error("Error removing team member from database:", error);
        // Fall back to local storage
        const storedTeamMembers = this.getStoredTeamMembers();
        const updatedTeamMembers = storedTeamMembers.filter(tm => tm.id !== teamMemberId);
        localStorage.setItem('teamMembers', JSON.stringify(updatedTeamMembers));
        sessionStorage.setItem('managedUsers', JSON.stringify(updatedTeamMembers));
      } else {
        // Update session storage
        const storedTeamMembers = await this.getTeamMembers();
        sessionStorage.setItem('managedUsers', JSON.stringify(storedTeamMembers));
      }
    } catch (err) {
      console.error("Exception removing team member:", err);
      throw err;
    }
  }
}

// Export a singleton instance
export const teamService = new TeamService();

/**
 * Hook for working with team members
 */
export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const refreshTeamMembers = React.useCallback(async () => {
    setLoading(true);
    try {
      const members = await teamService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error("Error refreshing team members:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  React.useEffect(() => {
    refreshTeamMembers();
    
    // Listen for team member events
    const handleTeamMemberAdded = () => refreshTeamMembers();
    const handleTeamMemberRemoved = () => refreshTeamMembers();
    
    window.addEventListener('team-member-added', handleTeamMemberAdded);
    window.addEventListener('team-member-removed', handleTeamMemberRemoved);
    
    return () => {
      window.removeEventListener('team-member-added', handleTeamMemberAdded);
      window.removeEventListener('team-member-removed', handleTeamMemberRemoved);
    };
  }, [refreshTeamMembers]);
  
  const addTeamMember = React.useCallback(async (teamMember: Omit<TeamMember, 'id'>) => {
    try {
      const newMember = await teamService.addTeamMember(teamMember);
      setTeamMembers(prev => [...prev, newMember]);
      window.dispatchEvent(new CustomEvent('team-member-added'));
      return newMember;
    } catch (error) {
      console.error("Error adding team member:", error);
      throw error;
    }
  }, []);
  
  const removeTeamMember = React.useCallback(async (teamMemberId: string) => {
    try {
      await teamService.removeTeamMember(teamMemberId);
      setTeamMembers(prev => prev.filter(tm => tm.id !== teamMemberId));
      window.dispatchEvent(new CustomEvent('team-member-removed'));
    } catch (error) {
      console.error("Error removing team member:", error);
      throw error;
    }
  }, []);
  
  return {
    teamMembers,
    loading,
    refreshTeamMembers,
    addTeamMember,
    removeTeamMember
  };
}
