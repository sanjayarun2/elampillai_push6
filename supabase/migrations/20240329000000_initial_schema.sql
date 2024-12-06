-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    whatsapp_link TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON settings;
DROP POLICY IF EXISTS "Enable update for all users" ON settings;
DROP POLICY IF EXISTS "Enable delete for all users" ON settings;

-- Create comprehensive RLS policies with no authentication required
CREATE POLICY "Enable read access for all users" ON settings
    FOR SELECT TO PUBLIC USING (true);

CREATE POLICY "Enable insert for all users" ON settings
    FOR INSERT TO PUBLIC WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON settings
    FOR UPDATE TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON settings
    FOR DELETE TO PUBLIC USING (true);

-- Insert default settings with proper conflict handling
INSERT INTO settings (id, whatsapp_link, updated_at)
VALUES ('1', '', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE 
SET whatsapp_link = EXCLUDED.whatsapp_link,
    updated_at = EXCLUDED.updated_at;