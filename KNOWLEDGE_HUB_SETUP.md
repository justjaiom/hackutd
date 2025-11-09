# Knowledge Hub Setup Instructions

## Overview
The Knowledge Hub has been successfully created with file upload functionality, including:
- Drag-and-drop file upload interface
- File listing with metadata
- Delete functionality
- Supabase Storage integration

## Files Created/Modified

### 1. Database Migration
**File:** `supabase/migrations/007_knowledge_hub_enhancements.sql`
- Adds RLS policies for INSERT, UPDATE, and DELETE on `project_data_sources`
- Adds `storage_path` column for Supabase Storage integration
- Creates indexes for better query performance

### 2. UI Component
**File:** `components/KnowledgeHub.tsx`
- Drag-and-drop file upload interface
- File list with icons based on mime type
- Upload progress indicators
- Delete confirmation dialogs

### 3. API Endpoints
- **GET** `/api/projects/[projectId]/data-sources/route.ts` - List all files
- **POST** `/api/projects/[projectId]/data-sources/upload/route.ts` - Upload files
- **DELETE** `/api/projects/[projectId]/data-sources/[dataSourceId]/route.ts` - Delete files

### 4. Project Page Integration
**File:** `app/projects/[projectId]/page.tsx`
- Integrated KnowledgeHub component in the "Docs & Files" tab

## Supabase Storage Setup

### Step 1: Create Storage Bucket
1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Name it: `project-files`
5. Make it **Public** (so authenticated users can download files)
6. Click **Create bucket**

### Step 2: Set Storage Policies
After creating the bucket, set up the following policies:

```sql
-- Policy to allow authenticated users to upload files
CREATE POLICY "Users can upload files to their projects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files' 
  AND (storage.foldername(name))[1] IN (
    SELECT projects.id::text FROM public.projects
    JOIN public.companies ON companies.id = projects.company_id
    WHERE companies.owner_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = companies.id
      AND company_members.user_id = auth.uid()::text
    )
  )
);

-- Policy to allow users to view files from their projects
CREATE POLICY "Users can view files from their projects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] IN (
    SELECT projects.id::text FROM public.projects
    JOIN public.companies ON companies.id = projects.company_id
    WHERE companies.owner_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = companies.id
      AND company_members.user_id = auth.uid()::text
    )
  )
);

-- Policy to allow users to delete files from their projects
CREATE POLICY "Users can delete files from their projects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files'
  AND (storage.foldername(name))[1] IN (
    SELECT projects.id::text FROM public.projects
    JOIN public.companies ON companies.id = projects.company_id
    WHERE companies.owner_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.company_members
      WHERE company_members.company_id = companies.id
      AND company_members.user_id = auth.uid()::text
      AND company_members.role IN ('owner', 'admin')
    )
  )
);
```

### Step 3: Run Database Migration
Run the new migration file to add the RLS policies:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL directly in the SQL Editor in Supabase Dashboard
```

## Testing the Knowledge Hub

1. **Navigate to a project** in your app
2. **Click on "Knowledge Hub"** tab
3. **Click on "Docs & Files"** sub-tab
4. **Upload files** by:
   - Clicking "Select Files" button, or
   - Dragging and dropping files onto the upload area
5. **View uploaded files** in the list below
6. **Delete files** by clicking the trash icon

## File Size Limits

By default, Supabase has file size limits:
- **Free tier**: 50MB per file
- **Pro tier**: 5GB per file

You can configure these in your Supabase Dashboard under **Storage** → **Settings**.

## Troubleshooting

### Files not uploading
- Check browser console for errors
- Verify storage bucket exists and is named `project-files`
- Verify storage policies are set correctly
- Check that user is authenticated

### Files not displaying
- Check that GET endpoint is working: `/api/projects/[projectId]/data-sources`
- Verify RLS policies on `project_data_sources` table
- Check browser network tab for API errors

### Permission errors
- Verify user is a member of the company that owns the project
- Check RLS policies match user's auth.uid()
- Ensure `auth0_id` in profiles table matches session user

## Future Enhancements

Potential improvements for the Knowledge Hub:
- [ ] File preview for images and PDFs
- [ ] Full-text search across documents
- [ ] AI-powered document analysis
- [ ] Version control for files
- [ ] Folder organization
- [ ] Batch file operations
- [ ] File sharing with external users
- [ ] Integration with Google Drive, Dropbox, etc.
