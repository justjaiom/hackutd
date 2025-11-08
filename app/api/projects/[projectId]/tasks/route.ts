import { getSession } from '@auth0/nextjs-auth0'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { projectId } = params

    // Get tasks for project
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, email, full_name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    // Get comments count for each task
    const tasksWithComments = await Promise.all(
      (tasks || []).map(async (task) => {
        const { count } = await supabase
          .from('task_comments')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', task.id)

        return {
          ...task,
          comments_count: count || 0,
        }
      })
    )

    return NextResponse.json({ tasks: tasksWithComments }, { status: 200 })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { projectId } = params
    const body = await request.json()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
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
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

