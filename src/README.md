
# Future Sentiment Analytics - Application Architecture

## Overview

Future Sentiment Analytics is a call analytics platform for sales teams that transcribes, analyzes, and provides insights from call recordings. The application helps sales managers track team performance, identify coaching opportunities, and improve sales outcomes through data-driven insights.

## Core Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: React Context API, Zustand, TanStack Query
- **Data Visualization**: Recharts
- **Authentication**: Supabase Auth

## Architecture

The application follows a feature-based architecture with the following structure:

```
src/
├── components/           # Reusable UI components
├── contexts/             # React context providers
├── features/             # Feature-specific components and logic
├── hooks/                # Custom React hooks
├── integrations/         # External service integrations
├── pages/                # Application pages
├── services/             # Business logic and data services
├── store/                # State management (Zustand)
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Data Flow Architecture

### Core Data Stores

1. **Database (Supabase)**:
   - Primary data store for persistent data
   - Contains tables: call_transcripts, calls, team_members
   - Used for long-term storage and multi-user access

2. **Local Storage**:
   - Used for team members when database table is missing
   - Stores user preferences and API keys
   - Persists between sessions on the same device

3. **Session Storage**:
   - Caches frequently accessed data like managed users
   - Cleared when browser session ends

### Services Architecture

#### TeamService
- **Primary responsibility**: Manage team member data
- **Data flow**: 
  - Attempts to fetch team members from Supabase first
  - Falls back to local storage if table doesn't exist
  - Creates demo data if no team members exist

#### SharedDataService
- **Primary responsibility**: Provide shared data across components
- **Data flow**:
  - getManagedUsers() accesses session storage first
  - Falls back to TeamService data
  - Provides demo data if nothing else is available

#### EventsService
- **Primary responsibility**: Cross-component communication
- **Event types**:
  - TEAM_MEMBER_ADDED: When a team member is added
  - TEAM_MEMBER_REMOVED: When a team member is removed
  - MANAGED_USERS_UPDATED: When the managed users list changes
  - CALL_UPDATED: When a call's assigned rep changes

#### DatabaseService
- **Primary responsibility**: Database interactions
- **Feature**: 
  - Checks for column/table existence
  - Caches schema information to reduce queries
  - Handles missing schema elements gracefully

## Key Features

1. **Call Analytics**
   - Transcription analysis
   - Sentiment analysis
   - Keyword tracking
   - Performance metrics

2. **Team Management**
   - Team member organization
   - Performance tracking
   - Call assignment

3. **Real-time Insights**
   - Live metric updates
   - Real-time data synchronization
   - Event-based updates

4. **Reporting & Visualization**
   - Trend analysis
   - Performance comparisons
   - Historical data visualization

## Authentication & Authorization

The application uses a role-based access control system:

- **Admins**: Full access to all features and data
- **Managers**: Can view and manage their team members
- **Users**: Can view their own calls and metrics

Authentication is handled through Supabase Auth, with custom logic in the AuthContext for role management.

## Event-Based Communication

Components communicate through an event system implemented in EventsService:

1. Components dispatch events when important changes occur
2. Other components listen for these events and update accordingly
3. This creates a loosely coupled, reactive architecture

## Error Handling & Resilience

The application includes robust error handling:

- Graceful fallbacks for missing data
- Multiple data sources as backups
- Offline detection and recovery
- Clear error messages for users

## Development Guidelines

When working on this application:

1. Use TypeScript for all new code
2. Create small, focused components (<100 lines)
3. Document all public functions and components with JSDoc
4. Add appropriate error handling
5. Ensure responsive design for all UI elements
6. Update unit tests for critical functionality
7. Use the established event system for cross-component communication
