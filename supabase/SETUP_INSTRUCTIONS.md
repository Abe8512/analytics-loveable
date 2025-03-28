# Advanced Sales Metrics Setup Instructions

This guide details how to set up the advanced sales metrics features in the Supabase database for Loveable Analytics.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Access to the Supabase project

## Setting Up the Database

### Option 1: Apply Migrations to Development Environment

1. Create a new branch for the database changes:
   ```bash
   git checkout -b cursor-edits
   ```

2. Apply the migrations to your local Supabase development environment:
   ```bash
   supabase db reset
   ```
   This will run both migration files and the seed.sql file.

3. Verify that the migrations were applied correctly:
   ```bash
   supabase db dump
   ```

4. Push the changes to the remote branch:
   ```bash
   git add supabase/
   git commit -m "Add advanced sales metrics schema"
   git push origin cursor-edits
   ```

### Option 2: Apply Migrations to Preview Branch

1. Create a preview branch in Supabase Studio.

2. Connect to the preview branch using the Supabase CLI:
   ```bash
   supabase link --project-ref <preview-branch-ref>
   ```

3. Apply the migrations:
   ```bash
   supabase db push
   ```

4. Run the seed script to populate sample data:
   ```bash
   supabase db execute < supabase/seed.sql
   ```

## Usage

Once the migrations are applied, the following functionalities will be available:

1. New metrics tables to store advanced sales data
2. Functions to calculate metrics from call data
3. Automatic updates to metrics when calls are added or modified

## Testing

You can test the functionality by:

1. Checking if test data was correctly inserted:
   ```sql
   SELECT * FROM objection_tracking LIMIT 10;
   ```

2. Verifying that metrics are calculated:
   ```sql
   SELECT id, objection_handling_score, trial_close_effectiveness, overall_quality_score 
   FROM calls LIMIT 10;
   ```

3. Testing daily summaries:
   ```sql
   SELECT * FROM call_metrics_summary ORDER BY date DESC;
   ```

## Troubleshooting

If you encounter any issues with the migrations:

1. Check the Supabase database logs
2. Verify that the PostgreSQL functions are created correctly:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_type='FUNCTION' 
   AND routine_schema='public';
   ```
3. Ensure that all tables have appropriate RLS policies 