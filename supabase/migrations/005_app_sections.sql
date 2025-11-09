-- Migration: 005_app_sections.sql
-- Purpose: Add tables to support Knowledge Hub, Meetings & Comms, and Decision/Action tracking.

-- Ensure extension for UUID already exists from 001
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================
-- REPOSITORIES (Code)
-- =============================
CREATE TABLE IF NOT EXISTS public.repositories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  provider TEXT CHECK (provider IN ('github','gitlab','bitbucket','azuredevops','other')),
  name TEXT,
  url TEXT NOT NULL,
  default_branch TEXT,
  visibility TEXT CHECK (visibility IN ('public','private')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_repositories_project_id ON public.repositories(project_id);

CREATE POLICY "Users can view repositories in their company projects"
  ON public.repositories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = repositories.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can insert repositories in their company projects"
  ON public.repositories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = repositories.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can update repositories in their company projects"
  ON public.repositories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = repositories.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

-- =============================
-- MEETINGS (Recordings & Transcripts)
-- =============================
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  duration_seconds INTEGER,
  data_source_id UUID REFERENCES public.project_data_sources(id) ON DELETE SET NULL,
  transcript TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON public.meetings(project_id);

CREATE POLICY "Users can view meetings in their company projects"
  ON public.meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = meetings.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can insert meetings in their company projects"
  ON public.meetings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = meetings.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can update meetings in their company projects"
  ON public.meetings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = meetings.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

-- =============================
-- DECISION LOG
-- =============================
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  decided_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  decided_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  links TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_decisions_project_id ON public.decisions(project_id);

CREATE POLICY "Users can view decisions in their company projects"
  ON public.decisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = decisions.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can insert decisions in their company projects"
  ON public.decisions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = decisions.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

-- =============================
-- ACTION ITEMS
-- =============================
CREATE TABLE IF NOT EXISTS public.action_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','done')),
  assignee_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_action_items_project_id ON public.action_items(project_id);

CREATE POLICY "Users can view action items in their company projects"
  ON public.action_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = action_items.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can insert action items in their company projects"
  ON public.action_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = action_items.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can update action items in their company projects"
  ON public.action_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = action_items.project_id
      AND (
        companies.owner_id::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id::text = auth.uid()::text
        )
      )
    )
  );
