
/**
 * Constants for event names to ensure consistency
 */
export const EVENTS = {
  TEAM_MEMBER_ADDED: 'team-member-added',
  TEAM_MEMBER_REMOVED: 'team-member-removed',
  MANAGED_USERS_UPDATED: 'managed-users-updated',
  CALL_UPDATED: 'call-updated'
};

/**
 * Service for managing cross-component communication via events
 */
export const eventsService = {
  /**
   * Dispatch an event
   */
  dispatch(eventName: string, detail?: any) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  },
  
  /**
   * Subscribe to an event
   */
  subscribe(eventName: string, handler: EventListener): () => void {
    window.addEventListener(eventName, handler);
    
    // Return a function to unsubscribe
    return () => {
      window.removeEventListener(eventName, handler);
    };
  },
  
  /**
   * Notify that team members have changed
   */
  notifyTeamMemberAdded(teamMember?: any) {
    this.dispatch(EVENTS.TEAM_MEMBER_ADDED, teamMember);
  },
  
  /**
   * Notify that a team member was removed
   */
  notifyTeamMemberRemoved(teamMemberId?: string) {
    this.dispatch(EVENTS.TEAM_MEMBER_REMOVED, teamMemberId);
  },
  
  /**
   * Notify that managed users list has been updated
   */
  notifyManagedUsersUpdated(users?: any[]) {
    this.dispatch(EVENTS.MANAGED_USERS_UPDATED, users);
  },
  
  /**
   * Notify that a call has been updated
   */
  notifyCallUpdated(callId?: string, changes?: any) {
    this.dispatch(EVENTS.CALL_UPDATED, { callId, changes });
  }
};
