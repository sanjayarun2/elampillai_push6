-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON settings;
DROP POLICY IF EXISTS "Enable update for all users" ON settings;
DROP POLICY IF EXISTS "Enable delete for all users" ON settings;
DROP POLICY IF EXISTS "Allow anonymous read access" ON settings;
DROP POLICY IF EXISTS "Allow anonymous insert" ON settings;
DROP POLICY IF EXISTS "Allow anonymous update" ON settings;
DROP POLICY IF EXISTS "Allow anonymous delete" ON settings;

-- Disable RLS temporarily to ensure initial data can be inserted
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Ensure settings table exists with correct structure
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    whatsapp_link TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert or update default settings
INSERT INTO settings (id, whatsapp_link, updated_at)
VALUES ('1', '', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE 
SET updated_at = CURRENT_TIMESTAMP;

-- Re-enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create new permissive policies
CREATE POLICY "Allow all operations for anonymous users" ON settings
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON settings TO public;
GRANT ALL ON ALL TABLES IN SCHEMA public TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO public;

-- Create or replace function for settings initialization
CREATE OR REPLACE FUNCTION initialize_settings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO settings (id, whatsapp_link, updated_at)
    VALUES ('1', '', CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION initialize_settings() TO public;