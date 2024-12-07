-- Drop and recreate push_subscriptions table
DROP TABLE IF EXISTS push_subscriptions CASCADE;

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT UNIQUE NOT NULL,
    auth TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    ip_address TEXT,  -- New column for IP address
    user_agent TEXT,  -- New column for user agent
    device_type TEXT, -- New column for device type
    browser TEXT,     -- New column for browser
    os TEXT,          -- New column for OS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true -- Default active to true
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS push_subscriptions_created_at_idx ON push_subscriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS push_subscriptions_active_idx ON push_subscriptions(active); -- Index for active status

-- Enable Row-Level Security (RLS)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for all operations
CREATE POLICY "Allow all operations" ON push_subscriptions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Grant permissions for roles
GRANT ALL ON push_subscriptions TO anon;
GRANT ALL ON push_subscriptions TO authenticated;
GRANT ALL ON SEQUENCE push_subscriptions_id_seq TO anon;
GRANT ALL ON SEQUENCE push_subscriptions_id_seq TO authenticated;
