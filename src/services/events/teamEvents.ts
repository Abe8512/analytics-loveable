
import { TeamMember } from '@/types/teamTypes';
import { EventsStore } from './store';
import { EventPayload, TeamEventType, EventType } from './types';

/**
 * Dispatches a team-member-added event
 * @param teamMember The team member that was added
 */
export function dispatchTeamMemberAdded(teamMember: TeamMember) {
  EventsStore.dispatchEvent('team-member-added' as EventType, {
    teamMember,
    timestamp: Date.now()
  });
}

/**
 * Adds a listener for the team-member-added event
 * @param callback Function to call when the event is triggered
 * @returns Function to remove the listener
 */
export function onTeamMemberAdded(callback: (payload: EventPayload) => void) {
  return EventsStore.addEventListener('team-member-added' as EventType, callback);
}

/**
 * Dispatches a team-member-removed event
 * @param teamMemberId ID of the team member that was removed
 */
export function dispatchTeamMemberRemoved(teamMemberId: string) {
  EventsStore.dispatchEvent('team-member-removed' as EventType, {
    teamMemberId,
    timestamp: Date.now()
  });
}

/**
 * Adds a listener for the team-member-removed event
 * @param callback Function to call when the event is triggered
 * @returns Function to remove the listener
 */
export function onTeamMemberRemoved(callback: (payload: EventPayload) => void) {
  return EventsStore.addEventListener('team-member-removed' as EventType, callback);
}
