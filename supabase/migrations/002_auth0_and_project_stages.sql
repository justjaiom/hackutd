-- ============================================================================
-- MIGRATION: Auth0 Integration and Project Stages/Ideologies
-- ============================================================================
-- This migration updates the schema to work with Auth0 and adds project
-- management stages and ideologies

-- ============================================================================
-- UPDATE PROFILES TABLE FOR AUTH0
-- ============================================================================
-- Remove reference to auth.users since we're using Auth0
-- Change id to TEXT to store Auth0 user ID
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Add Auth0-specific fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth0_id TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS picture TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;

-- ============================================================================
-- UPDATE RLS POLICIES FOR AUTH0
-- ============================================================================
-- Drop old policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create new policies that work with Auth0 (we'll use a function to get user ID)
-- For now, we'll allow users to view/update their own profiles based on auth0_id
-- Note: You'll need to pass the user ID from Auth0 session in your application

-- Temporary: Allow all authenticated users (you'll need to implement proper RLS based on Auth0)
CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE
  USING (true);

CREATE POLICY "Users can insert profiles" ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- UPDATE COMPANIES TABLE
-- ============================================================================
ALTER TABLE public.companies ALTER COLUMN owner_id TYPE TEXT;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view companies they own" ON public.companies;
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their companies" ON public.companies;

CREATE POLICY "Users can view companies" ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Users can create companies" ON public.companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update companies" ON public.companies FOR UPDATE
  USING (true);

-- ============================================================================
-- UPDATE COMPANY MEMBERS TABLE
-- ============================================================================
ALTER TABLE public.company_members ALTER COLUMN user_id TYPE TEXT;

DROP POLICY IF EXISTS "Users can view company members of their companies" ON public.company_members;

CREATE POLICY "Users can view company members" ON public.company_members FOR SELECT
  USING (true);

-- ============================================================================
-- ADD PROJECT STAGES AND IDEOLOGIES
-- ============================================================================
-- Add project stage/phase field
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'ideation' 
  CHECK (stage IN ('ideation', 'planning', 'development', 'testing', 'launch', 'maintenance', 'retirement'));

-- Add project ideology/methodology field
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS methodology TEXT DEFAULT 'agile'
  CHECK (methodology IN ('agile', 'scrum', 'kanban', 'waterfall', 'lean', 'devops', 'hybrid'));

-- Add project lifecycle stage
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'early'
  CHECK (lifecycle_stage IN ('early', 'growth', 'mature', 'declining'));

-- Add sprint/iteration information
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS current_sprint TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS sprint_duration_days INTEGER DEFAULT 14;

-- Add project health metrics
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- ============================================================================
-- ENHANCE TASKS TABLE FOR PROJECT MANAGEMENT
-- ============================================================================
ALTER TABLE public.projects ALTER COLUMN created_by TYPE TEXT;

-- Update tasks table
ALTER TABLE public.tasks ALTER COLUMN assignee_id TYPE TEXT;
ALTER TABLE public.tasks ALTER COLUMN created_by TYPE TEXT;

-- Add more task fields for project management
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS story_points INTEGER;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS epic_id UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS component TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS fix_version TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS resolution TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS time_spent INTEGER; -- in minutes
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS time_remaining INTEGER; -- in minutes
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID;

-- Add task type
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'task'
  CHECK (task_type IN ('task', 'bug', 'feature', 'epic', 'story', 'subtask', 'improvement'));

-- Add task workflow state (more granular than status)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS workflow_state TEXT DEFAULT 'backlog'
  CHECK (workflow_state IN ('backlog', 'todo', 'in_progress', 'in_review', 'testing', 'done', 'blocked', 'cancelled'));

-- Update status to match workflow_state for compatibility
-- Note: You may want to sync these fields in your application

-- ============================================================================
-- CREATE EPICS TABLE (for larger work items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.epics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_epics_project_id ON public.epics(project_id);
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view epics" ON public.epics FOR SELECT
  USING (true);

-- ============================================================================
-- CREATE SPRINTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  goal TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_sprints_project_id ON public.sprints(project_id);
CREATE INDEX idx_sprints_status ON public.sprints(status);
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sprints" ON public.sprints FOR SELECT
  USING (true);

-- Update tasks to reference sprints properly
ALTER TABLE public.tasks DROP COLUMN IF EXISTS sprint_id;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL;

-- ============================================================================
-- CREATE PROJECT WORKFLOWS TABLE (for custom workflows)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  stages JSONB NOT NULL, -- Array of stage definitions
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_project_workflows_project_id ON public.project_workflows(project_id);
ALTER TABLE public.project_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows" ON public.project_workflows FOR SELECT
  USING (true);

-- ============================================================================
-- CREATE TASK COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task comments" ON public.task_comments FOR SELECT
  USING (true);

-- ============================================================================
-- CREATE TASK ACTIVITY LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.task_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'assigned', etc.
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_task_activity_log_task_id ON public.task_activity_log(task_id);
CREATE INDEX idx_task_activity_log_created_at ON public.task_activity_log(created_at DESC);
ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task activity" ON public.task_activity_log FOR SELECT
  USING (true);

-- ============================================================================
-- UPDATE OTHER TABLES FOR AUTH0
-- ============================================================================
ALTER TABLE public.agents ALTER COLUMN project_id TYPE UUID USING project_id::UUID;
ALTER TABLE public.tensions ALTER COLUMN company_id TYPE UUID USING company_id::UUID;
ALTER TABLE public.tensions ALTER COLUMN project_id TYPE UUID USING project_id::UUID;
ALTER TABLE public.project_data_sources ALTER COLUMN project_id TYPE UUID USING project_id::UUID;
ALTER TABLE public.project_data_sources ALTER COLUMN uploaded_by TYPE TEXT;

-- Update agent_activities
ALTER TABLE public.agent_activities ALTER COLUMN agent_id TYPE UUID USING agent_id::UUID;
ALTER TABLE public.agent_activities ALTER COLUMN project_id TYPE UUID USING project_id::UUID;

-- ============================================================================
-- ADD TRIGGERS FOR NEW TABLES
-- ============================================================================
CREATE TRIGGER update_epics_updated_at BEFORE UPDATE ON public.epics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON public.sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_workflows_updated_at BEFORE UPDATE ON public.project_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON public.task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REMOVE OLD AUTH TRIGGER (Auth0 handles user creation)
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

