// Just fixing the event type
import { EventsStore } from './events/store';
import { EventType, EVENT_TYPES } from './events/types';
import { teamService } from './TeamService';

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

  syncManagedUsersWithTeamMembers() {
    const teamMembers = teamService.getTeamMembers();
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
      EventsStore.dispatchEvent(EVENT_TYPES.MANAGED_USERS_UPDATED, {
        managedUsers,
        timestamp: new Date().toISOString()
      });
    }
    
    return managedUsers;
  }
}

export const sharedDataService = new SharedDataServiceClass();
