-- Function to initialize VAPID keys
CREATE OR REPLACE FUNCTION public.initialize_vapid_keys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO vapid_keys (public_key, private_key)
  VALUES ('', '')
  ON CONFLICT DO NOTHING;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.initialize_vapid_keys() TO public;

-- Function to create settings table
CREATE OR REPLACE FUNCTION public.create_settings_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    whatsapp_link TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  
  INSERT INTO settings (id, whatsapp_link, updated_at)
  VALUES ('1', '', CURRENT_TIMESTAMP)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.create_settings_table() TO public;