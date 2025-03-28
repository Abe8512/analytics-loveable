
# Authentication System

## Overview

The authentication system in this application handles user identification, access control, and session management. It uses Supabase for backend authentication services and provides a robust client-side implementation to manage the auth state throughout the application.

## Architecture

```
┌─────────────────┐     ┌───────────────┐     ┌─────────────────┐
│                 │     │               │     │                 │
│  Auth Context   │────▶│  Auth Client  │────▶│    Supabase     │
│                 │     │               │     │                 │
└─────────────────┘     └───────────────┘     └─────────────────┘
        │                                              │
        │                                              │
        ▼                                              ▼
┌─────────────────┐                         ┌─────────────────┐
│                 │                         │                 │
│  Protected      │                         │  User Profile   │
│  Routes         │                         │  Management     │
│                 │                         │                 │
└─────────────────┘                         └─────────────────┘
```

## Key Components

### 1. AuthContext & AuthProvider

- Located in `src/contexts/AuthContext.tsx`
- Central state management for authentication
- Provides login, signup, logout, and password reset functionality
- Manages team member access for managers

### 2. ProtectedRoute

- Located in `src/components/auth/ProtectedRoute.tsx`
- Route wrapper that enforces authentication requirements
- Can require admin or manager privileges
- Redirects unauthenticated users and shows helpful messages

### 3. Auth Forms

- Login/Signup forms in `src/pages/Auth.tsx`
- Password reset in `src/pages/ForgotPassword.tsx`
- Form logic in `src/hooks/useAuthForm.ts`

## Role-Based Access Control

The system supports three main roles:

1. **Admin** - Can access all features and manage all users
2. **Manager** - Can manage their team members and view their data
3. **User** - Basic access to their own data and features

## Authentication Flow

1. User enters credentials on the login page
2. Auth context calls Supabase authentication
3. On success, user session and profile are loaded
4. Role information is retrieved and stored in context
5. User is redirected to their requested page or dashboard

## Error Handling

The system includes robust error handling:
- Form validation before submission
- Clear error messages for auth failures
- Offline detection and appropriate messaging
- Security protections against unauthorized access

## Development Guidelines

When working with the authentication system:

1. Always use the `useAuth()` hook to access auth state and functions
2. Protect routes with the `<ProtectedRoute>` component
3. Use role-based conditions (`isAdmin`, `isManager`) for permission checks
4. Handle loading states in UI to prevent flicker
5. Provide clear error messaging to users

## Related Files

- `src/contexts/AuthContext.tsx` - Main auth state provider
- `src/components/auth/ProtectedRoute.tsx` - Route protection
- `src/hooks/useAuthForm.ts` - Form management
- `src/hooks/useAuthClient.ts` - Supabase auth client
- `src/pages/Auth.tsx` - Login/Signup page
- `src/pages/ForgotPassword.tsx` - Password reset page
- `src/utils/formValidation.ts` - Form validation utilities
