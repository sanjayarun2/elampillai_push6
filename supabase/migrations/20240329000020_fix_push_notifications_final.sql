-- Drop existing tables to start fresh
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- Create push_subscriptions table
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT UNIQUE NOT NULL,
    auth TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true
);

-- Create notification_logs table
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);
CREATE INDEX push_subscriptions_active_idx ON push_subscriptions(active);
CREATE INDEX push_subscriptions_created_at_idx ON push_subscriptions(created_at);
CREATE INDEX notification_logs_subscription_id_idx ON notification_logs(subscription_id);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all access for push_subscriptions" ON push_subscriptions
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for notification_logs" ON notification_logs
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON push_subscriptions TO anon;
GRANT ALL ON notification_logs TO anon;
GRANT USAGE ON SCHEMA public TO anon;