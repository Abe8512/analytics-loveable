import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { EventsService, EventType } from "@/services/EventsService";
import * as SharedDataService from "@/services/SharedDataService";
import { errorHandler } from "./ErrorHandlingService";

// TeamMember type definition
export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar_url?: string;
  user_id?: string;
}

// Class to manage team members
class TeamService {
  private static instance: TeamService;
  private fetchPromise: Promise<TeamMember[]> | null = null;
  private lastFetchTime: number = 0;
  private cachedMembers: TeamMember[] | null = null;
  private fetchInProgress: boolean = false;
  private CACHE_TTL = 60000; // 1 minute cache
  
  // Demo data to use when no team members are found
  private demoTeamMembers: TeamMember[] = [
    {
      id: "demo-1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "Sales Manager",
      user_id: "demo-1"
    },
    {
      id: "demo-2",
      name: "Michael Chen",
      email: "michael@example.com",
      role: "Sales Representative",
      user_id: "demo-2"
    },
    {
      id: "demo-3",
      name: "Jessica Rodriguez",
      email: "jessica@example.com",
      role: "Account Executive",
      user_id: "demo-3"
    }
  ];
  
  private constructor() {
    console.log("TeamService initialized");
  }
  
  public static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }
  
  // Get team members with a hook for React components
  public useTeamMembers = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const mountedRef = useRef(true);
    
    const refreshTeamMembers = async () => {
      if (!mountedRef.current) return;
      setIsLoading(true);
      try {
        const members = await this.getTeamMembers();
        if (mountedRef.current) {
          setTeamMembers(members);
          // After refreshing, also sync with SharedDataService
          SharedDataService.syncManagedUsersWithTeamMembers(members);
          setError(null);
        }
      } catch (err) {
        console.error("Error refreshing team members:", err);
        if (mountedRef.current) {
          setError(err as Error);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    // Set up listeners for team member events
    useEffect(() => {
      // Initial load
      refreshTeamMembers();
      
      // Set up event listeners
      const removeAddedListener = EventsService.addEventListener('TEAM_MEMBER_ADDED' as EventType, refreshTeamMembers);
      const removeRemovedListener = EventsService.addEventListener('TEAM_MEMBER_REMOVED' as EventType, refreshTeamMembers);
      
      // Clean up listeners and set mounted ref
      return () => {
        mountedRef.current = false;
        removeAddedListener();
        removeRemovedListener();
      };
    }, []);
    
    return { teamMembers, isLoading, error, refreshTeamMembers };
  };
  
  // Get all team members with improved caching
  public async getTeamMembers(): Promise<TeamMember[]> {
    // Return cached members if available and not expired
    const now = Date.now();
    if (this.cachedMembers && (now - this.lastFetchTime < this.CACHE_TTL)) {
      return this.cachedMembers;
    }
    
    // If fetch is already in progress, return the existing promise
    if (this.fetchInProgress && this.fetchPromise) {
      return this.fetchPromise;
    }
    
    // Otherwise, start a new fetch
    this.fetchInProgress = true;
    this.fetchPromise = this._fetchTeamMembers();
    
    try {
      const members = await this.fetchPromise;
      this.cachedMembers = members;
      this.lastFetchTime = Date.now();
      return members;
    } finally {
      this.fetchInProgress = false;
    }
  }
  
  // Private method to actually fetch team members
  private async _fetchTeamMembers(): Promise<TeamMember[]> {
    try {
      // Try to get team members from Supabase
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching team members from database:", error);
        
        // Fall back to local storage
        console.log("Falling back to local storage for team members");
        const storedMembers = this.getStoredTeamMembers();
        return storedMembers;
      }
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} team members in database`);
        // Also store in local storage as a fallback
        this.storeTeamMembers(data);
        return data as TeamMember[];
      }
      
      // If no data in database, fall back to local storage
      console.log("No team members found in database, checking local storage");
      const storedMembers = this.getStoredTeamMembers();
      return storedMembers;
    } catch (err) {
      console.error("Error in getTeamMembers:", err);
      errorHandler.handleError(err, "TeamService.getTeamMembers");
      
      // Fall back to local storage in case of error
      const storedMembers = this.getStoredTeamMembers();
      return storedMembers;
    }
  }
  
  // Add a new team member
  public async addTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
    try {
      // Ensure required fields
      if (!member.name) {
        throw new Error("Team member name is required");
      }
      
      // Ensure ID
      const completeTeamMember: TeamMember = {
        id: member.id || uuidv4(),
        name: member.name,
        email: member.email || "",
        role: member.role || "",
        user_id: member.user_id || uuidv4(),
        avatar_url: member.avatar_url || ""
      };
      
      // Try to add to Supabase - fixing the type issue here
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          id: completeTeamMember.id,
          name: completeTeamMember.name,
          email: completeTeamMember.email || "",  // Ensure email is not undefined
          role: completeTeamMember.role,
          user_id: completeTeamMember.user_id,
          avatar_url: completeTeamMember.avatar_url
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding team member to database:", error);
        
        // Fall back to local storage
        console.log("Falling back to local storage for adding team member");
        const storedMembers = this.getStoredTeamMembers();
        storedMembers.push(completeTeamMember);
        this.storeTeamMembers(storedMembers);
        
        // Invalidate cache
        this.cachedMembers = null;
        
        // Dispatch event
        EventsService.dispatchEvent("TEAM_MEMBER_ADDED" as EventType, completeTeamMember);
        
        return completeTeamMember;
      }
      
      console.log("Team member added to database:", data);
      
      // Also store in local storage
      const storedMembers = this.getStoredTeamMembers();
      storedMembers.push(data);
      this.storeTeamMembers(storedMembers);
      
      // Invalidate cache
      this.cachedMembers = null;
      
      // Dispatch event
      EventsService.dispatchEvent("TEAM_MEMBER_ADDED" as EventType, data);
      
      return data;
    } catch (err) {
      console.error("Error in addTeamMember:", err);
      errorHandler.handleError(err, "TeamService.addTeamMember");
      throw err;
    }
  }
  
  // Remove a team member
  public async removeTeamMember(id: string): Promise<void> {
    try {
      // Try to remove from Supabase
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error removing team member from database:", error);
        
        // Fall back to local storage
        console.log("Falling back to local storage for removing team member");
        let storedMembers = this.getStoredTeamMembers();
        storedMembers = storedMembers.filter(member => member.id !== id);
        this.storeTeamMembers(storedMembers);
      }
      
      // Also remove from local storage
      let storedMembers = this.getStoredTeamMembers();
      storedMembers = storedMembers.filter(member => member.id !== id);
      this.storeTeamMembers(storedMembers);
      
      // Invalidate cache
      this.cachedMembers = null;
      
      // Dispatch event
      EventsService.dispatchEvent("TEAM_MEMBER_REMOVED" as EventType, { id });
      
    } catch (err) {
      console.error("Error in removeTeamMember:", err);
      errorHandler.handleError(err, "TeamService.removeTeamMember");
      throw err;
    }
  }
  
  // Get team members from local storage
  private getStoredTeamMembers(): TeamMember[] {
    try {
      const storedData = localStorage.getItem('teamMembers');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log(`Found ${parsedData.length} team members in local storage`);
          return parsedData;
        }
      }
      
      // If no data in local storage, use demo data
      console.log("No team members found in local storage, using demo data");
      this.storeTeamMembers(this.demoTeamMembers);
      return this.demoTeamMembers;
    } catch (error) {
      console.error("Error getting team members from local storage:", error);
      return this.demoTeamMembers;
    }
  }
  
  // Store team members in local storage
  private storeTeamMembers(members: TeamMember[]): void {
    try {
      localStorage.setItem('teamMembers', JSON.stringify(members));
    } catch (error) {
      console.error("Error storing team members in local storage:", error);
    }
  }
}

// Export singleton instance
export const teamService = TeamService.getInstance();
