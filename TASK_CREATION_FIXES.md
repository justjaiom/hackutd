# Task Creation Fixes Applied

## Issues Found & Fixed

### 1. **RLS Policies Missing**
The Row Level Security (RLS) policies for the tasks table were dropped but never recreated, preventing task creation.

**Fix Applied in Migration 006:**
```sql
-- Enable RLS on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for CRUD operations on tasks
CREATE POLICY "Users can view tasks in accessible projects" ON public.tasks FOR SELECT ...
CREATE POLICY "Users can create tasks in accessible projects" ON public.tasks FOR INSERT ...
CREATE POLICY "Users can update tasks in accessible projects" ON public.tasks FOR UPDATE ...
CREATE POLICY "Users can delete tasks in accessible projects" ON public.tasks FOR DELETE ...
```

### 2. **Profile Lookup Issue**
The task creation API was trying to use Supabase user ID to find profiles, but needed to handle cases where profiles don't exist.

**Fix Applied in API Route:**
```typescript
// Get user profile using Supabase user ID
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .maybeSingle()

if (!profile) {
  return NextResponse.json(
    { 
      error: 'User profile not found',
      debug: {
        user_id: user.id,
        profileError: profileError?.message
      }
    },
    { status: 404 }
  )
}
```

### 3. **Task Data Structure**
The task creation needed to handle all the new columns added in migration 002.

**Complete Task Data Structure:**
```typescript
const taskData = {
  project_id: projectId,
  title: body.title,
  description: body.description,
  status: body.status || 'todo',
  priority: body.priority || 'medium',
  task_type: body.task_type || 'task',
  workflow_state: body.workflow_state || body.status || 'todo',
  story_points: body.story_points,
  due_date: body.due_date,
  labels: body.labels || [],
  tags: body.tags || [],
  assignee_id: body.assignee_id,
  created_by: profile.id,
}
```

### 4. **Frontend Task Creation Modal**
The CreateTaskModal component needed to send proper data structure.

**Modal Form Data:**
```typescript
const formData = {
  title: '',
  description: '',
  status: 'todo' as Task['status'],
  priority: 'medium' as Task['priority'],
  task_type: 'task' as Task['task_type'],
  story_points: '',
  due_date: '',
  labels: '',
}

// On submit:
onCreate({
  project_id: projectId,
  title: formData.title,
  description: formData.description || null,
  status: formData.status,
  priority: formData.priority,
  task_type: formData.task_type,
  story_points: formData.story_points ? parseInt(formData.story_points) : null,
  due_date: formData.due_date || null,
  labels: formData.labels ? formData.labels.split(',').map(l => l.trim()) : [],
})
```

### 5. **Board Component Task Handling**
The Board component needed to properly handle task creation and updates.

**Task Creation Handler:**
```typescript
const handleTaskCreate = async (taskData: Partial<Task>) => {
  try {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })

    if (response.ok) {
      const newTask = await response.json()
      setTasks((prevTasks) => [...prevTasks, newTask.task])
      setIsCreateModalOpen(false)
    }
  } catch (error) {
    console.error('Error creating task:', error)
  }
}
```

## Database Migration Required

If you reset your database, you need to run all migrations in order:

```bash
# Run migrations in Supabase
supabase migration up
```

Or apply the migrations manually:
1. `001_initial_schema.sql` - Creates base tables
2. `002_auth0_and_project_stages.sql` - Adds task columns and updates structure
3. `006_fix_tasks_rls_policies.sql` - Fixes RLS policies for task operations

## Key Files Modified

1. **API Route**: `/app/api/projects/[projectId]/tasks/route.ts`
2. **Component**: `/components/Board/CreateTaskModal.tsx`
3. **Component**: `/components/Board/Board.tsx`
4. **Migration**: `/supabase/migrations/006_fix_tasks_rls_policies.sql`

## Testing Task Creation

After applying these fixes:
1. Create a project
2. Navigate to the project board
3. Click "Create Task"
4. Fill in task details
5. Submit - should create successfully

## Common Errors Fixed

- "User profile not found" - Fixed profile lookup
- RLS policy violations - Fixed with proper policies
- Missing columns - Added support for all task fields
- Task type constraints - Added proper validation