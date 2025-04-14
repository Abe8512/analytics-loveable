
import { EventsService } from "@/services/EventsService";
import { TeamMember } from "@/types/teamTypes";

export enum TeamEventType {
  TEAM_MEMBER_SELECTED = 'TEAM_MEMBER_SELECTED',
  TEAM_MEMBER_ADDED = 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED = 'TEAM_MEMBER_REMOVED',
  TEAM_MEMBER_UPDATED = 'TEAM_MEMBER_UPDATED',
  TEAM_METRICS_UPDATED = 'TEAM_METRICS_UPDATED'
}

/**
 * Dispatches a team member selected event
 * @param member The selected team member
 */
export const dispatchTeamMemberSelected = (member: TeamMember | null) => {
  EventsService.dispatchEvent(TeamEventType.TEAM_MEMBER_SELECTED, { member });
};

/**
 * Registers a listener for team member selection events
 * @param callback The callback function to execute when a team member is selected
 * @returns A function to remove the event listener
 */
export const onTeamMemberSelected = (callback: (member: TeamMember | null) => void) => {
  return EventsService.addEventListener(TeamEventType.TEAM_MEMBER_SELECTED, (data) => {
    callback(data?.member || null);
  });
};

/**
 * Dispatches a team metrics updated event
 * @param metrics The updated metrics
 */
export const dispatchTeamMetricsUpdated = (metrics: any) => {
  EventsService.dispatchEvent(TeamEventType.TEAM_METRICS_UPDATED, { metrics });
};

/**
 * Registers a listener for team metrics updated events
 * @param callback The callback function to execute when team metrics are updated
 * @returns A function to remove the event listener
 */
export const onTeamMetricsUpdated = (callback: (metrics: any) => void) => {
  return EventsService.addEventListener(TeamEventType.TEAM_METRICS_UPDATED, (data) => {
    callback(data?.metrics || null);
  });
};
