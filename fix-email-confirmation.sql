-- Fix email confirmation issues in Supabase
-- Run this in your Supabase SQL Editor

-- 1. Confirm all existing users (so they can sign in immediately)
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. Disable email confirmation for future signups
-- Note: This might need to be done via the Supabase dashboard instead
-- Go to Authentication > Settings and disable "Enable email confirmations"

-- 3. Optional: Check which users were affected
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC;
