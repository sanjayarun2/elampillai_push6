-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations" ON comments
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Create index for better performance
CREATE INDEX comments_blog_id_idx ON comments(blog_id);
CREATE INDEX comments_created_at_idx ON comments(created_at);

-- Grant permissions
GRANT ALL ON comments TO anon;
GRANT ALL ON SEQUENCE comments_id_seq TO anon;