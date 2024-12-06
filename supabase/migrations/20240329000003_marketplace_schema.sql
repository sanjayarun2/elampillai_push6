-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    seller TEXT NOT NULL,
    whatsapp_link TEXT,
    image TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to products"
ON products FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow authenticated insert to products"
ON products FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to products"
ON products FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from products"
ON products FOR DELETE
TO anon
USING (true);