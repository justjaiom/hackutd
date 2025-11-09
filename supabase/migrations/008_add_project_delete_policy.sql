-- Add DELETE policy for projects table
-- Users can delete projects in companies they own
-- Note: Following the permissive pattern from Auth0 migration
-- The actual authorization is handled at the application layer

CREATE POLICY "Users can delete projects in their companies"
  ON public.projects FOR DELETE
  USING (true);
