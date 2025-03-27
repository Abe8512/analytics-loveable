
-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = LOWER($1)
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Function to get team metrics summary
CREATE OR REPLACE FUNCTION public.get_team_metrics_summary()
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
  IF public.check_table_exists('team_metrics_summary') THEN
    RETURN QUERY SELECT row_to_json(t)::jsonb FROM (
      SELECT * FROM public.team_metrics_summary
    ) t;
  ELSE
    -- Return empty set if table doesn't exist
    RETURN;
  END IF;
END;
$$;
