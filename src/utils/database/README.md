
# Database Maintenance Utilities

## Overview

This directory contains utilities for managing the database schema, maintenance tasks, and ensuring data consistency. These utilities handle creating required tables, configuring real-time functionality, and managing Row-Level Security (RLS) policies.

## Key Utilities

### 1. Database Functions (`setupDatabaseFunctions.ts`)

Creates essential database helper functions:

- `check_table_exists`: Verifies if a table exists
- `drop_table_if_exists`: Safely drops a table
- `set_replica_identity_full`: Sets REPLICA IDENTITY for real-time functionality
- `add_table_to_publication`: Adds a table to the real-time publication
- `drop_development_access_policies`: Removes development-only policies
- `create_authenticated_access_policies`: Creates proper production policies

### 2. RLS Policy Management (`secureRLSPolicies.ts`)

Secures the database by:

- Removing public/anonymous access policies
- Adding proper authenticated user policies
- Ensuring production-ready security

### 3. Real-time Configuration (`configureRealtime.ts`)

Sets up tables for real-time updates:

- Sets REPLICA IDENTITY to FULL for tracked changes
- Adds tables to the Supabase real-time publication
- Ensures real-time updates work properly

### 4. Technical Debt Cleanup (`cleanupTechnicalDebt.ts`)

Removes unnecessary:

- Backup tables
- Duplicate data
- Deprecated tables/columns

### 5. Schema Creation (`createSalesInsightsTable.ts`)

Creates required tables that might be missing:

- Sales insights
- Team members
- Analytics tables

## Usage Examples

### Initial Database Setup

```typescript
import { setupDatabaseFunctions } from '@/utils/setupDatabaseFunctions';
import { configureRealtime } from '@/utils/configureRealtime';
import { createSalesInsightsTable } from '@/utils/createSalesInsightsTable';

async function initializeDatabase() {
  // Create required database functions
  await setupDatabaseFunctions();
  
  // Configure tables for real-time updates
  await configureRealtime();
  
  // Create any missing tables
  await createSalesInsightsTable();
}
```

### Securing for Production

```typescript
import { secureRLSPolicies } from '@/utils/secureRLSPolicies';
import { cleanupTechnicalDebt } from '@/utils/cleanupTechnicalDebt';

async function prepareForProduction() {
  // Secure RLS policies
  const securityResult = await secureRLSPolicies();
  console.log('Security update:', securityResult.message);
  
  // Clean up technical debt
  const cleanupResult = await cleanupTechnicalDebt();
  console.log('Cleanup:', cleanupResult.message);
}
```

## SQL Functions

The database functions create several SQL functions in the database:

```sql
-- Check if a table exists
SELECT check_table_exists('my_table');

-- Drop a table if it exists
SELECT drop_table_if_exists('old_backup_table');

-- Set REPLICA IDENTITY for real-time
SELECT set_replica_identity_full('calls');

-- Add table to real-time publication
SELECT add_table_to_publication('team_members', 'supabase_realtime');

-- Clean up development policies
SELECT drop_development_access_policies('calls');

-- Create authenticated user policies
SELECT create_authenticated_access_policies('calls');
```

## Best Practices

1. **Run setup on application initialization**: Call `setupDatabaseFunctions` when the app starts
2. **Handle errors gracefully**: All functions return result objects with success/error info
3. **Log operations**: Keep track of database changes for debugging
4. **Test in development**: Test database changes in dev before applying to production
5. **Secure before deployment**: Run `secureRLSPolicies` before production deployment
6. **Clean up regularly**: Periodically run `cleanupTechnicalDebt` to remove unnecessary data

## Database Schema Dependencies

The utility functions assume certain tables exist or handle their absence gracefully:

- `call_transcripts`
- `calls`
- `team_members`
- `sentiment_trends`
- `keyword_trends`
- `call_metrics_summary`
- `rep_metrics_summary`

If these tables don't exist, some functions will create them or use fallback mechanisms.
