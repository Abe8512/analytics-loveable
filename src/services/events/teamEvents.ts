
import { EventsStore } from './store';
import { EventType, EventPayload, TeamEventType } from './types';

/**
 * Emit team member added event
 * @param teamMember The newly added team member
 */
export const emitTeamMemberAdded = (teamMember: any) => {
  if (!teamMember) return false;

  EventsStore.dispatchEvent('team-member-added' as EventType, {
    teamMember,
    timestamp: new Date().toISOString()
  });

  return true;
};

/**
 * Listen for team member added events
 * @param callback Function to call when a team member is added
 */
export const onTeamMemberAdded = (callback: (payload: EventPayload) => void) => {
  return EventsStore.addEventListener('team-member-added' as EventType, callback);
};

/**
 * Emit team member removed event
 * @param teamMemberId ID of the removed team member
 */
export const emitTeamMemberRemoved = (teamMemberId: string) => {
  if (!teamMemberId) return false;

  EventsStore.dispatchEvent('team-member-removed' as EventType, {
    teamMemberId,
    timestamp: new Date().toISOString()
  });

  return true;
};

/**
 * Listen for team member removed events
 * @param callback Function to call when a team member is removed
 */
export const onTeamMemberRemoved = (callback: (payload: EventPayload) => void) => {
  return EventsStore.addEventListener('team-member-removed' as EventType, callback);
};
