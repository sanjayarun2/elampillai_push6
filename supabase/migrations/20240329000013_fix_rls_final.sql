-- Temporarily disable RLS
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations" ON settings;
DROP POLICY IF EXISTS "Allow all operations" ON blogs;
DROP POLICY IF EXISTS "Allow all operations" ON push_subscriptions;
DROP POLICY IF EXISTS "Allow all operations" ON notifications;

-- Create new unified policies
CREATE POLICY "Enable all access" ON settings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON blogs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON push_subscriptions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON notifications FOR ALL TO public USING (true) WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Grant all permissions to public and anon roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO public;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO public;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Ensure settings initialization function exists
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION initialize_settings() TO public;
GRANT EXECUTE ON FUNCTION initialize_settings() TO anon;