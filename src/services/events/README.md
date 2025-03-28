
# Event System Architecture

## Overview

The event system enables loosely coupled communication between components throughout the application. It provides a pub/sub mechanism that allows components to communicate without direct dependencies.

## Core Components

### EventsService

The `EventsService` class (`EventsService.ts`) provides the main API for the event system:

- `dispatchEvent(type, payload)`: Sends an event to all listeners
- `addEventListener(type, listener)`: Registers a listener for an event type
- `removeEventListener(type, listener)`: Removes a previously registered listener
- `useEventListener(type, callback)`: React hook for event listening

### Store Implementation (Zustand)

The backing store (`store.ts`) uses Zustand to manage:

- Event listeners
- Event history
- Dispatch logic

### Hooks

Custom React hooks (`hooks.ts`) provide easy integration with React components:

- `useEventListener`: Subscribe to events in React components
- `useEventDispatcher`: Get a function to dispatch events
- `useEventHistory`: Access event history
- `useLastEvent`: Track the most recent event of a specific type

## Event Types

Standard event types are defined in `types.ts` and include:

- `TEAM_MEMBER_ADDED`: When a new team member is added
- `TEAM_MEMBER_REMOVED`: When a team member is removed
- `MANAGED_USERS_UPDATED`: When the list of managed users changes
- `CALL_UPDATED`: When a call record is updated

## Usage Examples

### Dispatching Events

```typescript
// When a user adds a team member
import { EventsService } from '@/services/EventsService';

function addTeamMember(member) {
  // Add to database/store
  // ...
  
  // Notify the system
  EventsService.dispatchEvent('TEAM_MEMBER_ADDED', member);
}
```

### Listening for Events in Components

```typescript
// In a component that needs to know about team changes
import { useEffect } from 'react';
import { EventsService } from '@/services/EventsService';

function TeamList() {
  const [teamMembers, setTeamMembers] = useState([]);
  
  useEffect(() => {
    // Initial load
    loadTeamMembers();
    
    // Listen for changes
    const unsubscribe = EventsService.addEventListener(
      'TEAM_MEMBER_ADDED', 
      handleTeamMemberAdded
    );
    
    return () => {
      unsubscribe(); // Clean up listener
    };
  }, []);
  
  // Handler for the event
  const handleTeamMemberAdded = (payload) => {
    setTeamMembers(prevMembers => [...prevMembers, payload.data]);
  };
  
  // ...rest of component
}
```

### Using Hooks in Functional Components

```typescript
import { useEventListener } from '@/services/events/hooks';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  
  // Use the hook to listen for events
  useEventListener('CALL_UPDATED', (payload) => {
    setNotifications(prev => [
      { 
        id: Date.now(), 
        message: `Call updated: ${payload.data.id}`, 
        timestamp: new Date() 
      },
      ...prev
    ]);
  });
  
  // ...rest of component
}
```

## Best Practices

1. **Unsubscribe from events** in component cleanup functions
2. **Keep event payloads serializable** - don't include functions or complex objects
3. **Use typed event names** from the EVENT_TYPES constant
4. **Document new event types** when adding them
5. **Don't overuse events** - only use for cross-component communication
6. **Include a timestamp** in event payloads (added automatically)
7. **Handle errors** in event listeners to prevent cascading failures

## Debugging

The event system includes built-in logging of events to the console, which can be useful for debugging. Events are also stored in history for inspection.

You can access event history programmatically:

```typescript
import { useEventHistory } from '@/services/events/hooks';

function DebugPanel() {
  const allEvents = useEventHistory();
  // Or specific types
  const teamEvents = useEventHistory(['TEAM_MEMBER_ADDED', 'TEAM_MEMBER_REMOVED']);
  
  // ...display events
}
```
