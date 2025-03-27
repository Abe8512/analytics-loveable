
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
  table_name TEXT,
  column_name TEXT
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
    AND table_name = check_column_exists.table_name
    AND column_name = check_column_exists.column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$;
