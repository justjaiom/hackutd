-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
-- Note: The following line requires superuser permissions and is not needed in Supabase managed environment
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- This extends the auth.users table with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- COMPANIES/ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view companies they own"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- COMPANY MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(company_id, user_id)
);

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company members of their companies"
  ON public.company_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_members.company_id
      AND companies.owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
-- Drop the table if it exists without company_id (from previous failed migration)
DO $$
BEGIN
  -- Check if projects table exists but doesn't have company_id column
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'projects'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'company_id'
  ) THEN
    -- Drop the table if it's missing the company_id column
    DROP TABLE IF EXISTS public.projects CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed', 'on_hold')),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their companies"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = projects.company_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create projects in their companies"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = projects.company_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
          AND company_members.role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Users can update projects in their companies"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = projects.company_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
          AND company_members.role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_effort INTEGER, -- in hours
  actual_effort INTEGER, -- in hours
  dependencies UUID[] DEFAULT '{}', -- array of task IDs
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their company projects"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = tasks.project_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create tasks in their company projects"
  ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = tasks.project_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
          AND company_members.role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

CREATE POLICY "Users can update tasks in their company projects"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = tasks.project_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
          AND company_members.role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- ============================================================================
-- AGENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('lead', 'technical', 'design', 'operations', 'communication')),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'processing', 'error')),
  configuration JSONB DEFAULT '{}'::jsonb,
  last_active_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_agents_project_id ON public.agents(project_id);
CREATE INDEX idx_agents_type ON public.agents(agent_type);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agents in their company projects"
  ON public.agents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = agents.project_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- TENSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tensions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  detected_by_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_tensions_company_id ON public.tensions(company_id);
CREATE INDEX idx_tensions_project_id ON public.tensions(project_id);
CREATE INDEX idx_tensions_status ON public.tensions(status);

ALTER TABLE public.tensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tensions in their companies"
  ON public.tensions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = tensions.company_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create tensions in their companies"
  ON public.tensions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = tensions.company_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- PROJECT DATA SOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_data_sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('meeting', 'document', 'video', 'transcript', 'file', 'note')),
  source_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_project_data_sources_project_id ON public.project_data_sources(project_id);
CREATE INDEX idx_project_data_sources_processed ON public.project_data_sources(processed);

ALTER TABLE public.project_data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view data sources in their company projects"
  ON public.project_data_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = project_data_sources.project_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- AGENT ACTIVITIES TABLE (for logging agent actions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agent_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_agent_activities_agent_id ON public.agent_activities(agent_id);
CREATE INDEX idx_agent_activities_project_id ON public.agent_activities(project_id);
CREATE INDEX idx_agent_activities_created_at ON public.agent_activities(created_at DESC);

ALTER TABLE public.agent_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agent activities in their company projects"
  ON public.agent_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = agent_activities.project_id
      AND (
        companies.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
-- Drop triggers if they already exist (from previous migration attempts)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
DROP TRIGGER IF EXISTS update_tensions_updated_at ON public.tensions;
DROP TRIGGER IF EXISTS update_project_data_sources_updated_at ON public.project_data_sources;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tensions_updated_at BEFORE UPDATE ON public.tensions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_data_sources_updated_at BEFORE UPDATE ON public.project_data_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
-- Drop trigger if it already exists (from previous migration attempt)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

