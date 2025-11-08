# Supabase Setup Guide

This guide will help you set up Supabase for the Adjacent project.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed
3. Next.js project set up

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: `adjacent` (or your preferred name)
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Click "Create new project"

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values from Step 2.

## Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click "New query"
4. Open the file `supabase/migrations/001_initial_schema.sql` from this project
5. Copy the entire SQL content
6. Paste it into the SQL Editor
7. Click "Run" to execute the migration

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

## Step 5: Verify Setup

1. In your Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
   - `profiles`
   - `companies`
   - `company_members`
   - `projects`
   - `tasks`
   - `agents`
   - `tensions`
   - `project_data_sources`
   - `agent_activities`

## Step 6: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable the authentication methods you want to use:
   - **Email** (enabled by default)
   - **Google** (optional)
   - **GitHub** (optional)
   - etc.

3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and reset password emails

## Step 7: Set Up Row Level Security (RLS)

The migration script already includes RLS policies, but you can verify them:

1. Go to **Authentication** → **Policies**
2. Verify that policies are set up for:
   - Users can only view/edit their own profiles
   - Users can only access companies they own or are members of
   - Users can only access projects within their companies
   - etc.

## Database Schema Overview

### Core Tables

- **profiles**: User profile information (extends auth.users)
- **companies**: Company/organization information
- **company_members**: Many-to-many relationship between users and companies
- **projects**: Project information
- **tasks**: Task information (Jira-style tasks)
- **agents**: AI agent configurations and status
- **tensions**: Tensions detected by agents
- **project_data_sources**: Uploaded files, meeting notes, etc.
- **agent_activities**: Log of agent actions

### Key Features

- **Row Level Security (RLS)**: All tables have RLS enabled for security
- **Automatic Timestamps**: `created_at` and `updated_at` are automatically managed
- **Cascading Deletes**: Related records are automatically deleted when parent records are deleted
- **JSONB Fields**: Flexible metadata storage using JSONB

## Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test authentication:
   - Try signing up a new user
   - Check the Supabase dashboard → **Authentication** → **Users** to see the new user
   - Check the **Table Editor** → **profiles** to see the user profile

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Verify your environment variables are set correctly
   - Make sure you're using the `anon` key, not the `service_role` key (for client-side code)

2. **"Relation does not exist" error**
   - Make sure you've run the migration SQL script
   - Verify the tables exist in the Supabase dashboard

3. **"Row Level Security policy violation" error**
   - Check that the user is authenticated
   - Verify RLS policies are set up correctly
   - Check that the user has the necessary permissions

### Getting Help

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in the project repository

## Next Steps

After setting up Supabase:

1. Implement authentication UI (sign up, sign in, sign out)
2. Create user dashboard
3. Implement company/project management
4. Set up file uploads for project data sources
5. Implement agent integration
6. Add real-time subscriptions for live updates

