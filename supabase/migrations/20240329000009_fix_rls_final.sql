-- Disable RLS temporarily
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE vapid_keys DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON settings;
DROP POLICY IF EXISTS "Enable update for all users" ON settings;
DROP POLICY IF EXISTS "Enable delete for all users" ON settings;

-- Re-enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vapid_keys ENABLE ROW LEVEL SECURITY;

-- Create new policies for settings
CREATE POLICY "Allow all operations for settings"
    ON settings FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Create new policies for push_subscriptions
CREATE POLICY "Allow all operations for push_subscriptions"
    ON push_subscriptions FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Create new policies for notifications
CREATE POLICY "Allow all operations for notifications"
    ON notifications FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Create new policies for vapid_keys
CREATE POLICY "Allow all operations for vapid_keys"
    ON vapid_keys FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Grant all permissions to public role
GRANT ALL ON ALL TABLES IN SCHEMA public TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO public;

-- Ensure initialize_settings function exists with proper permissions
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

GRANT EXECUTE ON FUNCTION initialize_settings() TO public;