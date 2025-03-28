-- Add these tables to real-time publication for live updates
DO $$ 
BEGIN
  -- Check if the function exists before using it
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'add_table_to_realtime_publication') THEN
    PERFORM add_table_to_realtime_publication('objection_tracking');
    PERFORM add_table_to_realtime_publication('trial_closes');
    PERFORM add_table_to_realtime_publication('price_sensitivity');
    PERFORM add_table_to_realtime_publication('sentiment_transitions');
    PERFORM add_table_to_realtime_publication('empathy_markers');
    PERFORM add_table_to_realtime_publication('competitor_mentions');
    PERFORM add_table_to_realtime_publication('call_quality_metrics');
    PERFORM add_table_to_realtime_publication('call_metrics_summary');
  END IF;
END $$;

-- Set REPLICA IDENTITY to FULL for all tables to ensure all columns are included in change events
DO $$ 
BEGIN
  -- Check if the function exists before using it
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_replica_identity_full_for_table') THEN
    PERFORM set_replica_identity_full_for_table('objection_tracking');
    PERFORM set_replica_identity_full_for_table('trial_closes');
    PERFORM set_replica_identity_full_for_table('price_sensitivity');
    PERFORM set_replica_identity_full_for_table('sentiment_transitions');
    PERFORM set_replica_identity_full_for_table('empathy_markers');
    PERFORM set_replica_identity_full_for_table('competitor_mentions');
    PERFORM set_replica_identity_full_for_table('call_quality_metrics');
    PERFORM set_replica_identity_full_for_table('call_metrics_summary');
  ELSE
    -- Alternative approach if function doesn't exist
    EXECUTE 'ALTER TABLE public.objection_tracking REPLICA IDENTITY FULL';
    EXECUTE 'ALTER TABLE public.trial_closes REPLICA IDENTITY FULL';
    EXECUTE 'ALTER TABLE public.price_sensitivity REPLICA IDENTITY FULL';
    EXECUTE 'ALTER TABLE public.sentiment_transitions REPLICA IDENTITY FULL';
    EXECUTE 'ALTER TABLE public.empathy_markers REPLICA IDENTITY FULL';
    EXECUTE 'ALTER TABLE public.competitor_mentions REPLICA IDENTITY FULL';
    EXECUTE 'ALTER TABLE public.call_quality_metrics REPLICA IDENTITY FULL';
    EXECUTE 'ALTER TABLE public.call_metrics_summary REPLICA IDENTITY FULL';
  END IF;
END $$; 