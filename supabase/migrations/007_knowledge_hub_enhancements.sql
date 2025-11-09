-- ============================================================================
-- KNOWLEDGE HUB ENHANCEMENTS
-- ============================================================================
-- This migration enhances the project_data_sources table for the Knowledge Hub
-- by adding missing RLS policies for create, update, and delete operations.

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can create data sources in accessible projects" ON public.project_data_sources;
DROP POLICY IF EXISTS "Users can update data sources in accessible projects" ON public.project_data_sources;
DROP POLICY IF EXISTS "Users can delete data sources in accessible projects" ON public.project_data_sources;

-- Add missing RLS policies for project_data_sources
-- Users can insert data sources in projects they have access to
CREATE POLICY "Users can create data sources in accessible projects" ON public.project_data_sources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = project_data_sources.project_id
      AND (
        -- Company owner can create data sources
        companies.owner_id = auth.uid()::text
        OR 
        -- Company members can create data sources
        EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()::text
          AND company_members.role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- Users can update data sources in projects they have access to
CREATE POLICY "Users can update data sources in accessible projects" ON public.project_data_sources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = project_data_sources.project_id
      AND (
        -- Company owner can update data sources
        companies.owner_id = auth.uid()::text
        OR 
        -- Company members can update data sources
        EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()::text
          AND company_members.role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- Users can delete data sources in projects they have access to
CREATE POLICY "Users can delete data sources in accessible projects" ON public.project_data_sources
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = project_data_sources.project_id
      AND (
        -- Company owner can delete data sources
        companies.owner_id = auth.uid()::text
        OR 
        -- Company members with admin/owner role can delete data sources
        EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()::text
          AND company_members.role IN ('owner', 'admin')
        )
      )
    )
  );

-- Add storage_path column for Supabase Storage integration (optional but recommended)
ALTER TABLE public.project_data_sources 
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_project_data_sources_storage_path ON public.project_data_sources(storage_path);
CREATE INDEX IF NOT EXISTS idx_project_data_sources_uploaded_by ON public.project_data_sources(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_data_sources_source_type ON public.project_data_sources(source_type);
