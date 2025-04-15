
// Just fixing the event type
import { EventsStore } from './events/store';
import { EventType } from './events/types';
import { teamService } from './TeamService';
import { TeamMember } from '@/types/teamTypes';

export interface TeamMetricsData {
  totalCalls: number;
  avgSentiment: number;
  avgTalkRatio: { agent: number; customer: number };
  topKeywords: string[];
}

export class SharedDataServiceClass {
  private managedUsersKey = 'managedUsers';

  getManagedUsers() {
    const storedUsers = sessionStorage.getItem(this.managedUsersKey);
    return storedUsers ? JSON.parse(storedUsers) : [];
  }

  setManagedUsers(users: any[]) {
    sessionStorage.setItem(this.managedUsersKey, JSON.stringify(users));
  }

  clearManagedUsers() {
    sessionStorage.removeItem(this.managedUsersKey);
  }

  async syncManagedUsersWithTeamMembers() {
    try {
      const teamMembers = await teamService.getTeamMembers();
      const currentManagedUsers = this.getManagedUsers();
      
      // Update managed users based on team members
      const managedUsers = teamMembers.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role || 'sales-rep'
      }));
      
      // Store in session storage
      sessionStorage.setItem('managedUsers', JSON.stringify(managedUsers));
      
      // If there's a change, dispatch an event
      if (JSON.stringify(currentManagedUsers) !== JSON.stringify(managedUsers)) {
        EventsStore.dispatchEvent('MANAGED_USERS_UPDATED' as EventType, {
          managedUsers,
          timestamp: new Date().toISOString()
        });
      }
      
      return managedUsers;
    } catch (error) {
      console.error('Error syncing managed users with team members:', error);
      return this.getManagedUsers();
    }
  }
}

export const sharedDataService = new SharedDataServiceClass();
