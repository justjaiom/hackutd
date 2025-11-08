# Adjacent Setup Guide

This guide will help you set up the complete Adjacent application with Auth0 authentication and Supabase database.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (https://supabase.com)
- An Auth0 account (https://auth0.com)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a Supabase project at https://app.supabase.com
2. Get your project URL and anon key from Settings → API
3. Run the database migrations:
   - Go to SQL Editor in Supabase dashboard
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_auth0_and_project_stages.sql`

## Step 3: Set Up Auth0

1. Create an Auth0 application at https://manage.auth0.com
2. Choose "Regular Web Application" → "Next.js"
3. Configure the following URLs:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
4. Get your Auth0 credentials:
   - Domain
   - Client ID
   - Client Secret

## Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Auth0 Configuration
AUTH0_SECRET='generate with: openssl rand -hex 32'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL='your-supabase-project-url'
NEXT_PUBLIC_SUPABASE_ANON_KEY='your-supabase-anon-key'

# App URL
NEXT_PUBLIC_APP_URL='http://localhost:3000'
```

Generate AUTH0_SECRET:
```bash
openssl rand -hex 32
```

## Step 5: Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 6: Test the Application

1. Click "Get Started" on the landing page
2. You'll be redirected to Auth0 login
3. After logging in, you'll be redirected to `/dashboard`
4. Your user will be automatically synced to the Supabase database
5. You should see the Jira-style board interface

## Features Implemented

### ✅ Authentication
- Auth0 integration
- User profile sync to Supabase
- Protected routes
- Session management

### ✅ Database Schema
- User profiles
- Companies/Organizations
- Projects with stages and methodologies
- Tasks with full project management features
- Agents
- Tensions
- Epics
- Sprints
- Workflows
- Task comments and activity logs

### ✅ Jira Board UI
- Kanban-style board with columns (To Do, In Progress, Review, Done)
- Task cards with all metadata
- Create task modal
- Search and filter functionality
- Priority and type indicators
- Story points and time tracking
- Labels and tags
- Assignee information

### ✅ Project Management Features
- Project stages (ideation, planning, development, testing, launch, maintenance, retirement)
- Project methodologies (agile, scrum, kanban, waterfall, lean, devops, hybrid)
- Lifecycle stages (early, growth, mature, declining)
- Task types (task, bug, feature, epic, story, subtask, improvement)
- Workflow states
- Sprint management
- Epic management

## API Routes

### Authentication
- `GET /api/auth/login` - Login
- `GET /api/auth/logout` - Logout
- `GET /api/auth/callback` - Auth0 callback
- `POST /api/users/sync` - Sync user to database

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create project

### Tasks
- `GET /api/projects/[projectId]/tasks` - Get project tasks
- `POST /api/projects/[projectId]/tasks` - Create task
- `PATCH /api/projects/[projectId]/tasks/[taskId]` - Update task
- `DELETE /api/projects/[projectId]/tasks/[taskId]` - Delete task

## Database Schema Overview

### Core Tables
- `profiles` - User profiles (synced from Auth0)
- `companies` - Companies/Organizations
- `company_members` - Company membership
- `projects` - Projects with stages and methodologies
- `tasks` - Tasks with full PM features
- `agents` - AI agent configurations
- `tensions` - Tensions detected by agents
- `epics` - Large work items
- `sprints` - Sprint management
- `project_workflows` - Custom workflows
- `task_comments` - Task comments
- `task_activity_log` - Task activity history
- `project_data_sources` - Uploaded files and data

## Next Steps

1. **AI Agent Integration**: Connect the agents to update the board automatically
2. **File Upload**: Implement file upload for project data sources
3. **Real-time Updates**: Add real-time updates using Supabase subscriptions
4. **Drag and Drop**: Implement drag-and-drop for moving tasks between columns
5. **Task Details**: Create a detailed task view modal
6. **Analytics**: Add project analytics and reporting
7. **Notifications**: Implement notifications for task updates

## Troubleshooting

### Auth0 Issues
- Make sure all URLs are configured correctly in Auth0 dashboard
- Verify AUTH0_SECRET is set correctly
- Check browser console for errors

### Database Issues
- Verify migrations have been run successfully
- Check Supabase RLS policies
- Verify user is being synced to database

### UI Issues
- Clear browser cache
- Check for console errors
- Verify all environment variables are set

## Documentation

- [Auth0 Setup Guide](./README_AUTH0.md)
- [Supabase Setup Guide](./README_SUPABASE.md)
- [Main README](./README.md)

