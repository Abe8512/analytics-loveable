
import { EventsStore } from './store';
import { TeamMember } from '@/types/teamTypes';
import { EventType, EVENT_TYPES } from './types';

/**
 * Dispatches a team member added event
 * @param teamMember The team member that was added
 */
export const dispatchTeamMemberAdded = (teamMember: TeamMember) => {
  EventsStore.dispatchEvent(EVENT_TYPES.TEAM_MEMBER_ADDED as EventType, {
    teamMember,
    timestamp: new Date().toISOString()
  });
};

/**
 * Dispatches a team member removed event
 * @param teamMemberId The ID of the team member that was removed
 */
export const dispatchTeamMemberRemoved = (teamMemberId: string) => {
  EventsStore.dispatchEvent(EVENT_TYPES.TEAM_MEMBER_REMOVED as EventType, {
    teamMemberId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Dispatches a managed users updated event
 * @param managedUsers The updated managed users
 */
export const dispatchManagedUsersUpdated = (managedUsers: TeamMember[]) => {
  EventsStore.dispatchEvent(EVENT_TYPES.MANAGED_USERS_UPDATED as EventType, {
    managedUsers,
    timestamp: new Date().toISOString()
  });
};

/**
 * Registers a listener for team member added events
 * @param callback The callback function to execute when a team member is added
 * @returns A function to remove the event listener
 */
export const onTeamMemberAdded = (callback: (teamMember: TeamMember) => void) => {
  return EventsStore.addEventListener(EVENT_TYPES.TEAM_MEMBER_ADDED as EventType, (data) => {
    callback(data?.teamMember);
  });
};

/**
 * Registers a listener for team member removed events
 * @param callback The callback function to execute when a team member is removed
 * @returns A function to remove the event listener
 */
export const onTeamMemberRemoved = (callback: (teamMemberId: string) => void) => {
  return EventsStore.addEventListener(EVENT_TYPES.TEAM_MEMBER_REMOVED as EventType, (data) => {
    callback(data?.teamMemberId);
  });
};

/**
 * Registers a listener for managed users updated events
 * @param callback The callback function to execute when managed users are updated
 * @returns A function to remove the event listener
 */
export const onManagedUsersUpdated = (callback: (managedUsers: TeamMember[]) => void) => {
  return EventsStore.addEventListener(EVENT_TYPES.MANAGED_USERS_UPDATED as EventType, (data) => {
    callback(data?.managedUsers || []);
  });
};

// Alias for backward compatibility with services using old naming convention
export const emitTeamMemberAdded = dispatchTeamMemberAdded;
export const emitTeamMemberRemoved = dispatchTeamMemberRemoved;
