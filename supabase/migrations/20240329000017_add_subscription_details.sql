-- Add columns for subscription details
ALTER TABLE push_subscriptions
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS last_used TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS push_subscriptions_last_used_idx ON push_subscriptions(last_used);

-- Update RLS policy
DROP POLICY IF EXISTS "Allow all operations" ON push_subscriptions;
CREATE POLICY "Allow all operations" ON push_subscriptions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);