# Run Lead Agent - Testing Guide

## Overview
The "Run Lead Agent" button has been implemented and enhanced in the project board. It uses AI to analyze project data sources and automatically generate tasks.

## Changes Made

### 1. API Endpoint Improvements (`/app/api/agents/nemotron/run-pipeline/route.ts`)
- ✅ **Updated to use Supabase authentication** instead of Auth0
- ✅ Enhanced error handling with detailed error messages
- ✅ Added check for empty data sources with helpful user message
- ✅ Improved profile lookup error handling
- ✅ Added priority value validation and normalization
- ✅ Better logging for debugging

### 2. Frontend Button Improvements (`/components/Board/Board.tsx`)
- ✅ Enhanced user feedback with emoji indicators
- ✅ Better error messages for different failure scenarios
- ✅ Improved loading state with disabled button styling
- ✅ Added proper finally block to ensure loading state is reset
- ✅ More descriptive success messages

## How It Works

### Flow:
1. User clicks "Run Lead Agent" button in the project board
2. Button makes POST request to `/api/agents/nemotron/run-pipeline` with projectId
3. Backend:
   - Validates user session using **Supabase authentication**
   - Looks up user profile by Supabase user ID
   - Fetches unprocessed data sources from Knowledge Hub
   - If no data sources: returns helpful message
   - Calls Nemotron AI orchestrator → extraction → planning pipeline
   - Creates tasks in database with proper validation
   - Marks data sources as processed
4. Frontend:
   - Displays loading state during processing
   - Refreshes task board on success
   - Shows success message with task count
   - Shows error message if something fails

### API Request Format:
```json
POST /api/agents/nemotron/run-pipeline
{
  "projectId": "uuid-of-project",
  "data_source_ids": ["optional-array-of-specific-sources"]
}
```

### API Response Format (Success):
```json
{
  "ok": true,
  "tasks": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "status": "todo",
      "priority": "medium",
      "created_by": "user-id",
      "metadata": { "source": "pipeline-planning" },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### API Response Format (No Data Sources):
```json
{
  "ok": true,
  "tasks": [],
  "message": "No unprocessed data sources found. Please add documents, repositories, or recordings to the Knowledge Hub first."
}
```

### API Response Format (Error):
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Testing Steps

### Prerequisites:
1. ✅ User must be authenticated using **Supabase authentication**
2. ✅ User profile must exist in database (id matches Supabase auth.users.id)
3. ✅ Project must exist and be accessible to user
4. ✅ Nemotron API keys must be configured in `.env.local`

### Test Case 1: Successful Task Creation
1. Navigate to a project's board page
2. Ensure the project has unprocessed data sources in Knowledge Hub
3. Click "Run Lead Agent" button
4. Expected: 
   - Button shows "Running Lead Agent..." during processing
   - Button is disabled while running
   - On success: Alert shows "✅ Lead Agent completed successfully! Created X new tasks"
   - Board refreshes and displays new tasks in "To Do" column

### Test Case 2: No Data Sources
1. Navigate to a project with no data sources (or all processed)
2. Click "Run Lead Agent" button
3. Expected:
   - Alert shows helpful message about adding data sources
   - No tasks created

### Test Case 3: Error Handling
1. Test with invalid project ID or network issues
2. Expected:
   - Alert shows "❌ Lead Agent failed:" with error details
   - Button returns to normal state

### Test Case 4: Priority Validation
The AI might return various priority formats. Our code normalizes them:
- Valid: "low", "medium", "high", "urgent" (case-insensitive)
- Invalid values → defaults to "medium"

## Environment Variables Required

```bash
# Supabase (for authentication and database)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Nemotron AI Keys
NEMOTRON_ORCHESTRATOR_KEY=nvapi-xxx  # For nvidia/nemotron-nano-9b-v2
NEMOTRON_EXTRACTION_KEY=nvapi-xxx    # For nvidia/nemotron-nano-12b-v2-vl
NEMOTRON_API_BASE=https://api.nvidia.com/v1
```

## Mock Mode (for testing without AI)

Set in `.env.local`:
```bash
NEMOTRON_MOCK=true
```

This will create stub tasks based on data sources without calling the AI API.

## Database Schema

Tasks are created with this structure:
- `id`: UUID (auto-generated)
- `project_id`: UUID (from request)
- `title`: string (from AI or "Untitled task")
- `description`: string | null (from AI)
- `status`: "todo" (default for new tasks)
- `priority`: "low" | "medium" | "high" | "urgent" (validated and normalized)
- `created_by`: UUID (user profile id)
- `metadata`: JSON with `source: "pipeline-planning"`
- `created_at`, `updated_at`: timestamps (auto-generated)

## Troubleshooting

### "User profile not found"
- User needs to be authenticated via Supabase
- Check if Supabase session is valid
- Verify profile exists in the `profiles` table with matching `id` from Supabase auth

### "Unauthorized"
- User is not authenticated with Supabase
- Session may have expired - try refreshing the page and signing in again

### "No unprocessed data sources"
- Add documents, repos, or recordings to Knowledge Hub
- Check that data sources have `processed: false` flag

### "Planning model did not return parsable tasks"
- AI model failed to return valid JSON
- Check Nemotron API keys and limits
- Try again or check logs for model output

### Tasks not appearing in board
- Check browser console for errors
- Verify `fetchTasks()` is called after agent completion
- Check that tasks have correct `project_id`
- Verify RLS policies allow user to see tasks

## Code Locations

- **Button Component**: `/components/Board/Board.tsx` (lines ~220-260)
- **API Endpoint**: `/app/api/agents/nemotron/run-pipeline/route.ts`
- **Task Types**: `/types/board.ts`
- **Nemotron Client**: `/lib/nemotronClient.ts`
