import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { projectId } = params
    const body = await request.json()
    
    console.log('Creating task with data:', {
      projectId,
      body,
      userId: user.id
    })

    // Get user profile using Supabase user ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    console.log('User ID:', user.id)
    console.log('Found profile:', profile ? `ID: ${profile.id}` : 'Not found')
    console.log('Profile error:', profileError)

    if (!profile) {
      console.error('No profile found for user:', user.id)
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

    // Prepare task data
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

    console.log('Inserting task with data:', taskData)

    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single()

    if (error) {
      console.error('Database error creating task:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create task',
          debug: {
            dbError: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          }
        },
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

