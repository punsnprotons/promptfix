# Disable Email Confirmation in Supabase

To disable email confirmation and allow immediate account creation:

## Method 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Settings**
3. Find **Email Confirmation** section
4. Toggle **Enable email confirmations** to **OFF**
5. Click **Save**

## Method 2: Via SQL (if needed)
Run this in your Supabase SQL Editor:

```sql
-- Update auth config to disable email confirmation
UPDATE auth.config SET enable_signup = true, enable_confirmations = false;
```

## Method 3: Via Environment Variables (if using self-hosted)
Add to your Supabase configuration:
```
GOTRUE_MAILER_AUTOCONFIRM=true
```

After making this change, users will be able to sign up and immediately sign in without email verification.
