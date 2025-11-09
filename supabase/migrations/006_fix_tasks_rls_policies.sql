-- ============================================================================
-- FIX RLS POLICIES FOR TASKS TABLE
-- ============================================================================
-- The tasks table RLS policies were dropped in 002_auth0_and_project_stages.sql
-- but never recreated, preventing task creation. This migration fixes that.

-- First, let's ensure RLS is enabled on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing tasks
-- Users can view tasks in projects they have access to through companies
CREATE POLICY "Users can view tasks in accessible projects" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = tasks.project_id
      AND (
        -- Company owner can see all tasks
        companies.owner_id = auth.uid()::text
        OR 
        -- Company members can see tasks
        EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()::text
          AND company_members.role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- Create policy for creating tasks
-- Users can create tasks in projects they have access to through companies
CREATE POLICY "Users can create tasks in accessible projects" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = tasks.project_id
      AND (
        -- Company owner can create tasks
        companies.owner_id = auth.uid()::text
        OR 
        -- Company members can create tasks
        EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()::text
          AND company_members.role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- Create policy for updating tasks
-- Users can update tasks in projects they have access to through companies
CREATE POLICY "Users can update tasks in accessible projects" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = tasks.project_id
      AND (
        -- Company owner can update tasks
        companies.owner_id = auth.uid()::text
        OR 
        -- Company members can update tasks
        EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()::text
          AND company_members.role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- Create policy for deleting tasks
-- Users can delete tasks in projects they have access to through companies
CREATE POLICY "Users can delete tasks in accessible projects" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = tasks.project_id
      AND (
        -- Company owner can delete tasks
        companies.owner_id = auth.uid()::text
        OR 
        -- Company members with admin/owner role can delete tasks
        EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()::text
          AND company_members.role IN ('owner', 'admin')
        )
      )
    )
  );