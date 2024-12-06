-- Enable Row Level Security (RLS)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for blogs table
CREATE POLICY "Allow public read access to blogs"
ON blogs FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow authenticated insert to blogs"
ON blogs FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to blogs"
ON blogs FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from blogs"
ON blogs FOR DELETE
TO anon
USING (true);

-- Create policies for shops table
CREATE POLICY "Allow public read access to shops"
ON shops FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow authenticated insert to shops"
ON shops FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to shops"
ON shops FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete from shops"
ON shops FOR DELETE
TO anon
USING (true);

-- Create policies for products table
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

-- Create policies for settings table
CREATE POLICY "Allow public read access to settings"
ON settings FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow authenticated update to settings"
ON settings FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);