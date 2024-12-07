-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate the push_subscriptions table with enhanced fields
DROP TABLE IF EXISTS push_subscriptions CASCADE;

CREATE TABLE push_subscriptions (
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS push_subscriptions_ip_idx ON push_subscriptions(ip_address);
CREATE INDEX IF NOT EXISTS push_subscriptions_active_idx ON push_subscriptions(active);

-- Ensure no NULL values in the `active` column if the column was added to an existing table
UPDATE push_subscriptions SET active = true WHERE active IS NULL;

-- Enable RLS (Row-Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for push_subscriptions
CREATE POLICY "Allow all operations" ON push_subscriptions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Grant permissions for `anon` role
GRANT SELECT ON push_subscriptions TO anon;
GRANT ALL ON push_subscriptions TO authenticated;
GRANT ALL ON SEQUENCE push_subscriptions_id_seq TO anon;
GRANT ALL ON SEQUENCE push_subscriptions_id_seq TO authenticated;

-- Create notifications table if necessary (from previous scripts)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID REFERENCES blogs(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id),
    subscription_id UUID REFERENCES push_subscriptions(id),
    status TEXT NOT NULL,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for notification-related tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for notifications and logs (allow all operations)
CREATE POLICY "Allow all operations" ON notifications
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations" ON notification_logs
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Grant permissions for notification tables
GRANT ALL ON notifications TO anon;
GRANT ALL ON notification_logs TO anon;

-- Grant permissions for sequences
GRANT ALL ON SEQUENCE notifications_id_seq TO anon;
GRANT ALL ON SEQUENCE notification_logs_id_seq TO anon;
