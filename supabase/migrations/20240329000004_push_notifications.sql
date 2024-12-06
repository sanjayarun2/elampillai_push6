-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT UNIQUE NOT NULL,
    auth TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Enable read access for all users" ON notifications
    FOR SELECT TO PUBLIC USING (true);

CREATE POLICY "Enable insert for all users" ON notifications
    FOR INSERT TO PUBLIC WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON notifications
    FOR UPDATE TO PUBLIC USING (true) WITH CHECK (true);

-- Create policies for push_subscriptions
CREATE POLICY "Enable read access for all users" ON push_subscriptions
    FOR SELECT TO PUBLIC USING (true);

CREATE POLICY "Enable insert for all users" ON push_subscriptions
    FOR INSERT TO PUBLIC WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON push_subscriptions
    FOR UPDATE TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON push_subscriptions
    FOR DELETE TO PUBLIC USING (true);