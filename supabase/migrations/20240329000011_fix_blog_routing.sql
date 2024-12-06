-- Drop existing blogs table if it exists
DROP TABLE IF EXISTS blogs CASCADE;

-- Create blogs table with proper structure
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    author TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disable RLS temporarily
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;

-- Insert some sample data
INSERT INTO blogs (title, content, date, author, image)
VALUES 
    ('Welcome to Elampillai', 'This is our first blog post about our wonderful community...', '2024-03-29', 'Admin', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000'),
    ('Local Festival Announcement', 'Join us for our annual festival celebration...', '2024-03-29', 'Admin', 'https://images.unsplash.com/photo-1514222788835-3a1a1d5b32f8');

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations for blogs"
    ON blogs FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS blogs_id_idx ON blogs(id);
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at DESC);

-- Grant permissions
GRANT ALL ON blogs TO public;