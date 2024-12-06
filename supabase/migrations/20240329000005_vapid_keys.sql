-- Create vapid_keys table
CREATE TABLE IF NOT EXISTS vapid_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_key TEXT NOT NULL,
    private_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE vapid_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous access
CREATE POLICY "Enable read access for all users" ON vapid_keys
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "Enable insert for all users" ON vapid_keys
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON vapid_keys
    FOR UPDATE TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON vapid_keys
    FOR DELETE TO anon
    USING (true);