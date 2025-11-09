-- Create project_data_sources table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_data_sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  storage_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processing_status TEXT DEFAULT 'pending',
  extracted_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on project_data_sources
ALTER TABLE public.project_data_sources ENABLE ROW LEVEL SECURITY;

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_project_data_sources_project_id ON public.project_data_sources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_data_sources_source_type ON public.project_data_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_project_data_sources_uploaded_by ON public.project_data_sources(uploaded_by);

-- Basic RLS policy for selecting data sources
CREATE POLICY "Users can view data sources in accessible projects" ON public.project_data_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.companies ON companies.id = projects.company_id
      WHERE projects.id = project_data_sources.project_id
      AND (
        companies.owner_id = auth.uid()::text
        OR 
        EXISTS (
          SELECT 1 FROM public.company_members
          WHERE company_members.company_id = companies.id
          AND company_members.user_id = auth.uid()::text
        )
      )
    )
  );