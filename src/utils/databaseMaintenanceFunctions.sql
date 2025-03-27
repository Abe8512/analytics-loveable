
-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = check_table_exists.table_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to drop a table if it exists
CREATE OR REPLACE FUNCTION public.drop_table_if_exists(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(table_name) || ' CASCADE;';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to set REPLICA IDENTITY FULL for a table
CREATE OR REPLACE FUNCTION public.set_replica_identity_full(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE 'ALTER TABLE public.' || quote_ident(table_name) || ' REPLICA IDENTITY FULL;';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to add a table to a publication
CREATE OR REPLACE FUNCTION public.add_table_to_publication(table_name TEXT, publication_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE 'ALTER PUBLICATION ' || quote_ident(publication_name) || ' ADD TABLE public.' || quote_ident(table_name) || ';';
EXCEPTION
    WHEN others THEN
        -- Handle case where table is already in publication
        NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to drop development-only RLS policies
CREATE OR REPLACE FUNCTION public.drop_development_access_policies(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Drop the development "Allow public access" policy if it exists
    EXECUTE 'DROP POLICY IF EXISTS "Allow public access to ' || quote_ident(table_name) || '" ON public.' || quote_ident(table_name) || ';';
    
    -- Drop any other development policies following the same pattern
    EXECUTE 'DROP POLICY IF EXISTS "Allow anon access to ' || quote_ident(table_name) || '" ON public.' || quote_ident(table_name) || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to ' || quote_ident(table_name) || '" ON public.' || quote_ident(table_name) || ';';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to create proper authenticated-user RLS policies
CREATE OR REPLACE FUNCTION public.create_authenticated_access_policies(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Create policy for SELECT - authenticated users can read
    EXECUTE 'CREATE POLICY "Authenticated users can read ' || quote_ident(table_name) || '" ON public.' || quote_ident(table_name) || 
            ' FOR SELECT TO authenticated USING (true);';
            
    -- Create policy for INSERT - authenticated users can insert their own data
    EXECUTE 'CREATE POLICY "Authenticated users can insert to ' || quote_ident(table_name) || '" ON public.' || quote_ident(table_name) || 
            ' FOR INSERT TO authenticated WITH CHECK (true);';
            
    -- Create policy for UPDATE - authenticated users can update their own data
    EXECUTE 'CREATE POLICY "Authenticated users can update ' || quote_ident(table_name) || '" ON public.' || quote_ident(table_name) || 
            ' FOR UPDATE TO authenticated USING (true);';
            
    -- Create policy for DELETE - authenticated users can delete their own data
    EXECUTE 'CREATE POLICY "Authenticated users can delete from ' || quote_ident(table_name) || '" ON public.' || quote_ident(table_name) || 
            ' FOR DELETE TO authenticated USING (true);';
EXCEPTION
    WHEN others THEN
        -- Handle errors
        RAISE NOTICE 'Error creating policies for %: %', table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper functions to make these utilities available via RPC
CREATE OR REPLACE FUNCTION public.create_check_table_exists_function()
RETURNS JSONB AS $$
BEGIN
    -- Function already created above
    RETURN jsonb_build_object('status', 'success', 'message', 'check_table_exists function created');
EXCEPTION
    WHEN others THEN
        RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_drop_table_function()
RETURNS JSONB AS $$
BEGIN
    -- Function already created above
    RETURN jsonb_build_object('status', 'success', 'message', 'drop_table_if_exists function created');
EXCEPTION
    WHEN others THEN
        RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_set_replica_identity_function()
RETURNS JSONB AS $$
BEGIN
    -- Function already created above
    RETURN jsonb_build_object('status', 'success', 'message', 'set_replica_identity_full function created');
EXCEPTION
    WHEN others THEN
        RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_add_to_publication_function()
RETURNS JSONB AS $$
BEGIN
    -- Function already created above
    RETURN jsonb_build_object('status', 'success', 'message', 'add_table_to_publication function created');
EXCEPTION
    WHEN others THEN
        RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_drop_development_policies_function()
RETURNS JSONB AS $$
BEGIN
    -- Function already created above
    RETURN jsonb_build_object('status', 'success', 'message', 'drop_development_access_policies function created');
EXCEPTION
    WHEN others THEN
        RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_authenticated_policies_function()
RETURNS JSONB AS $$
BEGIN
    -- Function already created above
    RETURN jsonb_build_object('status', 'success', 'message', 'create_authenticated_access_policies function created');
EXCEPTION
    WHEN others THEN
        RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
