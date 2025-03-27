
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { dispatchEvent } from './events/store';
import { EventType } from './events/types';
import { addEventListener, removeEventListener } from './events/store';

// Define the team member interface
interface TeamMember {
  id: string;
  name: string;
  email: string; // Making email required to match supabase schema
  role?: string;
  avatar_url?: string;
  member_id?: string;
  user_id: string; // Making user_id required to match supabase schema
}

// Helper function to generate demo team members
const generateDemoTeamMembers = (): TeamMember[] => {
  return [
    {
      id: "demo-1",
      name: "John Doe",
      email: "john@example.com",
      role: "Sales Rep",
      member_id: "d1",
      user_id: "demo-user-1"
    },
    {
      id: "demo-2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Sales Manager",
      member_id: "d2",
      user_id: "demo-user-2"
    },
    {
      id: "demo-3",
      name: "Dave Wilson",
      email: "dave@example.com",
      role: "Sales Rep",
      member_id: "d3",
      user_id: "demo-user-3"
    }
  ];
};

// Check if the team_members table exists in Supabase
const isTeamMembersTableMissing = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .select('id')
      .limit(1);
    
    // If there's an error that mentions the relation doesn't exist, the table is missing
    return error?.message.includes('relation "team_members" does not exist') || false;
  } catch (error) {
    console.error("Error checking if team_members table exists:", error);
    return true; // Assume missing if we can't check
  }
};

// Get team members from localStorage
const getStoredTeamMembers = (): TeamMember[] => {
  try {
    const storedTeamMembers = localStorage.getItem('teamMembers');
    if (storedTeamMembers) {
      return JSON.parse(storedTeamMembers);
    }
  } catch (error) {
    console.error("Error retrieving team members from localStorage:", error);
  }
  
  // Return demo data if nothing in localStorage
  const demoMembers = generateDemoTeamMembers();
  localStorage.setItem('teamMembers', JSON.stringify(demoMembers));
  return demoMembers;
};

// Save team members to localStorage
const storeTeamMembers = (teamMembers: TeamMember[]): void => {
  try {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  } catch (error) {
    console.error("Error storing team members in localStorage:", error);
  }
};

// Add a team member (to Supabase if available, otherwise localStorage)
const addTeamMember = async (member: Omit<Partial<TeamMember>, 'id'>): Promise<TeamMember | null> => {
  try {
    const newMember: TeamMember = {
      ...member,
      id: uuidv4(),
      user_id: member.user_id || uuidv4(), // Ensure user_id is set
      email: member.email || `${member.name?.toLowerCase().replace(' ', '.')}@example.com` || '', // Ensure email is set
      name: member.name || '',
    };
    
    const tableMissing = await isTeamMembersTableMissing();
    
    if (!tableMissing) {
      // Add to Supabase
      const { data, error } = await supabase
        .from('team_members')
        .insert([newMember])
        .select()
        .single();
      
      if (error) {
        console.error("Error adding team member to Supabase:", error);
        throw error;
      }
      
      // Dispatch event for components to refresh
      dispatchEvent('team-member-added' as EventType, { data });
      
      return data;
    } else {
      // Add to localStorage
      const teamMembers = getStoredTeamMembers();
      teamMembers.push(newMember);
      storeTeamMembers(teamMembers);
      
      // Dispatch event for components to refresh
      dispatchEvent('team-member-added' as EventType, { data: newMember });
      
      return newMember;
    }
  } catch (error) {
    console.error("Error adding team member:", error);
    return null;
  }
};

// Remove a team member (from Supabase if available, otherwise localStorage)
const removeTeamMember = async (id: string): Promise<boolean> => {
  try {
    const tableMissing = await isTeamMembersTableMissing();
    
    if (!tableMissing) {
      // Remove from Supabase
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error removing team member from Supabase:", error);
        throw error;
      }
    } 
    
    // Always update localStorage too
    const teamMembers = getStoredTeamMembers();
    const filteredMembers = teamMembers.filter(member => member.id !== id);
    storeTeamMembers(filteredMembers);
    
    // Dispatch event for components to refresh
    dispatchEvent('team-member-removed' as EventType, { id });
    
    return true;
  } catch (error) {
    console.error("Error removing team member:", error);
    return false;
  }
};

// Get all team members (from Supabase if available, otherwise localStorage)
const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const tableMissing = await isTeamMembersTableMissing();
    
    if (!tableMissing) {
      // Get from Supabase
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) {
        console.error("Error fetching team members from Supabase:", error);
        throw error;
      }
      
      if (data.length === 0) {
        // If no data in Supabase, use demo data and store it
        const demoMembers = generateDemoTeamMembers();
        
        // Store in both localStorage and Supabase
        storeTeamMembers(demoMembers);
        
        try {
          // Insert demo members one by one to avoid type mismatch issues
          for (const member of demoMembers) {
            await supabase
              .from('team_members')
              .insert([member]);
          }
        } catch (insertError) {
          console.error("Error inserting demo team members:", insertError);
        }
        
        return demoMembers;
      }
      
      return data;
    } else {
      // Get from localStorage
      return getStoredTeamMembers();
    }
  } catch (error) {
    console.error("Error fetching team members:", error);
    return getStoredTeamMembers(); // Fallback to localStorage
  }
};

// React hook for team members
const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const refreshTeamMembers = async () => {
    try {
      setIsLoading(true);
      const members = await getTeamMembers();
      setTeamMembers(members);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    refreshTeamMembers();
    
    // Add event listeners
    const removeAddedListener = addEventListener('team-member-added' as EventType, () => {
      refreshTeamMembers();
    });
    
    const removeRemovedListener = addEventListener('team-member-removed' as EventType, () => {
      refreshTeamMembers();
    });
    
    // Cleanup function
    return () => {
      if (removeAddedListener) removeAddedListener();
      if (removeRemovedListener) removeRemovedListener();
    };
  }, []);
  
  return { teamMembers, isLoading, error, refreshTeamMembers };
};

export const teamService = {
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  useTeamMembers
};

export default teamService;
