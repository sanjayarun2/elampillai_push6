-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON settings;
DROP POLICY IF EXISTS "Enable update for all users" ON settings;
DROP POLICY IF EXISTS "Enable delete for all users" ON settings;

-- Create new RLS policies for settings table
CREATE POLICY "Allow anonymous read access" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous delete" ON settings FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS settings_id_idx ON settings(id);
CREATE INDEX IF NOT EXISTS push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS notifications_blog_id_idx ON notifications(blog_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();