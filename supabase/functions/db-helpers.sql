
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

-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION public.check_column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = LOWER($1)
    AND column_name = LOWER($2)
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$;

-- Function to get rep metrics summary data
CREATE OR REPLACE FUNCTION public.get_rep_metrics_summary()
RETURNS SETOF public.rep_metrics_summary
LANGUAGE plpgsql
AS $$
BEGIN
  IF public.check_table_exists('rep_metrics_summary') THEN
    RETURN QUERY SELECT * FROM public.rep_metrics_summary;
  ELSE
    -- Return empty set if table doesn't exist
    RETURN;
  END IF;
END;
$$;

-- Function to get team metrics summary data - create it if needed
CREATE OR REPLACE FUNCTION public.get_team_metrics_summary()
RETURNS SETOF jsonb
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
