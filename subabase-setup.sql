-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    author TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT UNIQUE NOT NULL,
    auth TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID REFERENCES blogs(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    whatsapp_link TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations" ON blogs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON comments FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON push_subscriptions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON notifications FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON settings FOR ALL TO public USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS comments_blog_id_idx ON comments(blog_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS push_subscriptions_last_used_idx ON push_subscriptions(last_used);
CREATE INDEX IF NOT EXISTS notifications_blog_id_idx ON notifications(blog_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Insert default settings
INSERT INTO settings (id, whatsapp_link, updated_at)
VALUES ('1', '', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;