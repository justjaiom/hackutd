# Auth0 Setup Guide

This guide will help you set up Auth0 authentication for Adjacent.

## Prerequisites

1. An Auth0 account (sign up at https://auth0.com)
2. Node.js and npm installed
3. Next.js project set up

## Step 1: Create an Auth0 Application

1. Go to https://manage.auth0.com
2. Navigate to **Applications** → **Applications**
3. Click **Create Application**
4. Choose **Regular Web Application**
5. Give it a name (e.g., "Adjacent")
6. Select **Next.js** as the technology

## Step 2: Configure Auth0 Application

1. In your Auth0 application settings, configure the following:

   **Allowed Callback URLs:**
   ```
   http://localhost:3000/api/auth/callback
   https://your-domain.com/api/auth/callback
   ```

   **Allowed Logout URLs:**
   ```
   http://localhost:3000
   https://your-domain.com
   ```

   **Allowed Web Origins:**
   ```
   http://localhost:3000
   https://your-domain.com
   ```

2. Save the changes

## Step 3: Get Your Auth0 Credentials

1. In your Auth0 application settings, you'll find:
   - **Domain** (e.g., `your-tenant.auth0.com`)
   - **Client ID**
   - **Client Secret**

2. Copy these values - you'll need them for environment variables

## Step 4: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following environment variables:

```env
# Auth0 Configuration
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Optional: Auth0 Audience (if using API)
AUTH0_AUDIENCE='your-api-identifier'

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App URL (for user sync)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Generate AUTH0_SECRET:
   ```bash
   openssl rand -hex 32
   ```

## Step 5: Run Database Migrations

1. Make sure you've run the initial Supabase migration
2. Run the Auth0 migration (`002_auth0_and_project_stages.sql`) in your Supabase SQL Editor
3. This migration:
   - Updates the schema to work with Auth0 user IDs
   - Adds project stages and ideologies
   - Adds enhanced task management fields
   - Creates new tables for epics, sprints, and workflows

## Step 6: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/api/auth/login`
3. You should be redirected to Auth0 login
4. After logging in, you'll be redirected to `/dashboard`
5. Your user should be automatically synced to the Supabase database

## Step 7: Verify User Sync

1. Check your Supabase dashboard → **Table Editor** → **profiles**
2. You should see a new profile with your Auth0 user information
3. The `auth0_id` field should contain your Auth0 user ID (format: `auth0|...`)

## How It Works

1. **User Login**: User clicks login → redirected to Auth0 → authenticates → callback to `/api/auth/callback`
2. **User Sync**: After authentication, the user is automatically synced to Supabase via `/api/users/sync`
3. **Session Management**: Auth0 handles session management via cookies
4. **Protected Routes**: Use the `useUser` hook from `@auth0/nextjs-auth0/client` to check authentication status

## API Routes

- `GET /api/auth/login` - Initiate login
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/callback` - Auth0 callback (handles user sync)
- `GET /api/auth/me` - Get current user session
- `POST /api/users/sync` - Sync Auth0 user to Supabase (called automatically)

## Troubleshooting

### Common Issues

1. **"Invalid state" error**
   - Clear your browser cookies
   - Make sure AUTH0_SECRET is set correctly
   - Verify callback URLs are correct in Auth0 dashboard

2. **User not syncing to database**
   - Check that Supabase credentials are correct
   - Verify the migration has been run
   - Check browser console for errors
   - Verify NEXT_PUBLIC_APP_URL is set correctly

3. **"Unauthorized" errors**
   - Make sure you're logged in
   - Check that the session is being created correctly
   - Verify Auth0 credentials are correct

### Getting Help

- Auth0 Documentation: https://auth0.com/docs
- Next.js Auth0 SDK: https://auth0.com/docs/quickstart/webapp/nextjs
- Supabase Documentation: https://supabase.com/docs

## Next Steps

After setting up Auth0:

1. Customize the login experience in Auth0 dashboard
2. Add social logins (Google, GitHub, etc.)
3. Configure user metadata and roles
4. Set up email verification
5. Implement role-based access control (RBAC)

