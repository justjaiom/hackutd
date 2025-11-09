# Database Migration Guide

## Quick Fix: Run Migrations

The error "Could not find the table 'public.companies'" means your database migrations haven't been run yet.

## Step 1: Open Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** (in the left sidebar)

## Step 2: Run Migrations in Order

Run each migration file in order:

### Migration 1: Initial Schema
1. Click "New query" in SQL Editor
2. Open `supabase/migrations/001_initial_schema.sql` from your project
3. Copy the entire contents
4. Paste into SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)

### Migration 2: Auth0 Integration
1. Click "New query" again
2. Open `supabase/migrations/002_auth0_and_project_stages.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click "Run"

### Migration 3: Project Details (if exists)
If you have `003_project_details.sql`, run it:
1. New query
2. Copy contents from `003_project_details.sql`
3. Run

### Migration 4: Project Structure (if exists)
If you have `004_project_structure.sql`, run it:
1. New query
2. Copy contents from `004_project_structure.sql`
3. Run

### Migration 5: App Sections (if exists)
If you have `005_app_sections.sql`, run it:
1. New query
2. Copy contents from `005_app_sections.sql`
3. Run

## Step 3: Verify Tables Exist

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `profiles`
   - `companies`
   - `company_members`
   - `projects`
   - `tasks`
   - `agents`
   - `tensions`
   - `project_data_sources`
   - `agent_activities`

## Alternative: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

## After Running Migrations

Once migrations are complete, try creating a project again. The error should be resolved!

