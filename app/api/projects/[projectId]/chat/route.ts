import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamChatResponse, ProjectContext } from '@/lib/gemini'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationHistory } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const projectId = params.projectId

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name, description')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Fetch tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, description, status, priority, assignee')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    // Fetch data sources (files)
    const { data: dataSources } = await supabase
      .from('project_data_sources')
      .select('id, file_name, source_type, mime_type')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    // Build context
    const context: ProjectContext = {
      projectName: project.name,
      projectDescription: project.description || undefined,
      tasks: (tasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority || undefined,
        assignee: task.assignee || undefined,
      })),
      dataSources: (dataSources || []).map(ds => ({
        id: ds.id,
        file_name: ds.file_name || 'Untitled',
        source_type: ds.source_type,
        mime_type: ds.mime_type || undefined,
      })),
    }

    // Stream the response
    const stream = await streamChatResponse(
      message,
      context,
      conversationHistory || []
    )

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
