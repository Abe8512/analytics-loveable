
-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = check_table_exists.table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Function to get table metadata
CREATE OR REPLACE FUNCTION public.get_table_metadata()
RETURNS TABLE (
  table_name TEXT,
  table_type TEXT,
  table_schema TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tables.table_name,
    tables.table_type,
    tables.table_schema
  FROM 
    information_schema.tables tables
  WHERE 
    tables.table_schema = 'public'
  ORDER BY 
    tables.table_name;
END;
$$;

-- Function to get table columns
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name TEXT)
RETURNS TABLE (
  column_name TEXT,
  data_type TEXT,
  is_nullable TEXT,
  column_default TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    columns.column_name,
    columns.data_type,
    columns.is_nullable,
    columns.column_default
  FROM 
    information_schema.columns columns
  WHERE 
    columns.table_schema = 'public'
    AND columns.table_name = get_table_columns.table_name
  ORDER BY 
    columns.ordinal_position;
END;
$$;

-- Function to check if a column exists
CREATE OR REPLACE FUNCTION public.check_column_exists(
  p_table_name TEXT,
  p_column_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = check_column_exists.p_table_name
    AND column_name = check_column_exists.p_column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$;

-- Create call_details_view if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_call_details_view()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the view already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'call_details_view'
  ) THEN
    -- Create the view
    EXECUTE '
      CREATE OR REPLACE VIEW public.call_details_view AS
      SELECT 
        c.id,
        c.user_id,
        c.created_at,
        c.duration,
        c.sentiment_agent,
        c.sentiment_customer,
        c.talk_ratio_agent,
        c.talk_ratio_customer,
        c.filename,
        ct.text,
        ct.customer_name,
        ct.user_name,
        tm.name as rep_name
      FROM 
        calls c
      LEFT JOIN 
        call_transcripts ct ON c.id = ct.call_id
      LEFT JOIN 
        team_members tm ON c.user_id = tm.user_id::text
      ORDER BY 
        c.created_at DESC;
    ';
  END IF;
END;
$$;
