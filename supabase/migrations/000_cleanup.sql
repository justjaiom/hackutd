-- ============================================================================
-- CLEANUP SCRIPT: Drop all public schema tables (keeps auth schema intact)
-- ============================================================================
-- This script drops all tables in the public schema to start fresh
-- Auth tables (auth.users, etc.) are NOT affected

-- Drop all tables in public schema (in reverse dependency order)
-- CASCADE will automatically drop dependent objects (policies, triggers, etc.)
DROP TABLE IF EXISTS public.task_activity_log CASCADE;
DROP TABLE IF EXISTS public.task_comments CASCADE;
DROP TABLE IF EXISTS public.project_workflows CASCADE;
DROP TABLE IF EXISTS public.sprints CASCADE;
DROP TABLE IF EXISTS public.epics CASCADE;
DROP TABLE IF EXISTS public.agent_activities CASCADE;
DROP TABLE IF EXISTS public.project_data_sources CASCADE;
DROP TABLE IF EXISTS public.tensions CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.company_members CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE; -- Remove if exists (should be in auth schema)

-- Drop all functions (CASCADE will drop dependent objects)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop triggers on auth schema (if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Note: 
-- - All policies and triggers are automatically dropped when tables are dropped (CASCADE)
-- - auth.users and auth schema remain untouched
-- - After running this, run 001_initial_schema.sql and 002_auth0_and_project_stages.sql

