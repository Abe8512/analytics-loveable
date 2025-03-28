# Advanced Metrics Schema Migrations

This directory contains database migrations for the Loveable Analytics project's advanced metrics features.

## Migration Files

- `20240328000000_add_advanced_metrics_tables.sql`: Creates all necessary tables for storing advanced metrics data, including:
  - `call_metrics_summary` - Daily aggregated call metrics
  - `objection_tracking` - Records objections raised during calls and their handling
  - `trial_closes` - Tracks trial close attempts and success rates
  - `price_sensitivity` - Records reactions to price discussions
  - `sentiment_transitions` - Tracks changes in sentiment during calls
  - `empathy_markers` - Records instances of empathy shown by sales reps
  - `competitor_mentions` - Tracks mentions of competitors and counter-arguments

- `20240328000001_add_advanced_metrics_functions.sql`: Adds PostgreSQL functions for calculating metrics:
  - `calculate_objection_handling_metrics` - Scores objection handling effectiveness
  - `calculate_trial_close_effectiveness` - Measures success rate of trial closes
  - `calculate_sentiment_recovery_metrics` - Tracks how well negative sentiment is turned positive
  - `calculate_empathy_metrics` - Scores empathy shown during calls
  - `calculate_competitor_handling_score` - Evaluates responses to competitor mentions
  - `calculate_call_quality_score` - Calculates overall call quality using multiple factors
  - `update_call_metrics_summary` - Updates the daily metrics summary
  - Also adds a trigger to automatically update metrics when calls are modified

## Testing the Migrations

The migrations can be tested by running:

```bash
supabase db reset
```

This will apply the migrations and then run the `seed.sql` file to populate test data.

## Relationship to Existing Schema

These migrations extend the existing database by:

1. Adding new tables for specialized metrics tracking
2. Adding columns to the `calls` table for storing quality scores
3. Creating functions to calculate metrics from call data
4. Setting up a trigger to automatically update metrics when calls are added or modified

All tables have appropriate Row Level Security (RLS) policies to match the existing security model. 