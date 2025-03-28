# Enhanced Metrics Database Setup

This directory contains the SQL migration files needed to add enhanced sales metrics capabilities to the Future Sentiment Analytics platform.

## Migration Files

1. `01_enhanced_metrics_tables.sql` - Creates the tables for storing enhanced metrics data
2. `02_enhanced_metrics_functions.sql` - Adds the functions and triggers for calculating metrics
3. `03_realtime_setup.sql` - Configures real-time features for the new tables

## Setup Instructions

### Option 1: Using Supabase UI

1. Log in to your Supabase project
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of each migration file, in order (01, 02, 03)
5. Run each script separately

### Option 2: Using CLI (Recommended)

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Apply the migrations:
   ```bash
   supabase db push
   ```

## Validating Setup

After running the migrations, you can verify that everything is set up correctly by:

1. Navigate to the Database section in Supabase UI
2. Check that the following tables have been created:
   - `objection_tracking`
   - `trial_closes`
   - `price_sensitivity`
   - `sentiment_transitions`
   - `empathy_markers`
   - `competitor_mentions`
   - `call_quality_metrics`
   - `call_metrics_summary`

3. Verify functions by running:
   ```sql
   SELECT * FROM pg_proc WHERE proname LIKE 'calculate%';
   ```

4. Check that the trigger has been created:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'update_metrics_on_call_change_trigger';
   ```

## Troubleshooting

If you encounter any issues:

1. Check the SQL logs for error messages
2. Verify that all dependencies (like the `calls` table) exist before running migrations
3. If real-time features aren't working, ensure your project has real-time enabled in the Supabase settings

### Common Issues

- **Function Already Exists**: If you see errors about functions already existing, you can drop them first:
  ```sql
  DROP FUNCTION IF EXISTS calculate_objection_handling_metrics(UUID);
  ```

- **Permission Denied**: Ensure you have the right permissions for your Supabase project

- **Missing Tables**: If referenced tables are missing, check that the base tables (like `calls`) exist first

## Documentation

For more details on the enhanced metrics system:

- Check `src/types/enhanced-metrics.ts` for TypeScript type definitions
- See `src/services/AdvancedMetricsService.ts` for client-side implementation
- Refer to the component documentation for UI integration 