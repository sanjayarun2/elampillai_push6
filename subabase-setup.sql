-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create push_subscriptions table with enhanced fields
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT UNIQUE NOT NULL,
    auth TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true
);

-- Ensure no NULL values in the `active` column
UPDATE push_subscriptions SET active = true WHERE active IS NULL;

-- Enable RLS for all tables
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for push_subscriptions
CREATE POLICY "Allow all operations" ON push_subscriptions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS push_subscriptions_ip_idx ON push_subscriptions(ip_address);
CREATE INDEX IF NOT EXISTS push_subscriptions_active_idx ON push_subscriptions(active);

-- Grant permissions for `anon` role
GRANT SELECT ON push_subscriptions TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
