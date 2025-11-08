import { getSession } from '@auth0/nextjs-auth0'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type NeMoResult = {
  summary?: string
  tensions?: Array<{ title: string; description?: string; priority?: string }>
  tasks?: Array<{ title: string; description?: string; priority?: string }>
}

async function runLocalStub(dataSources: any[]): Promise<NeMoResult> {
  // Very small deterministic stub: create one tension per data source
  const tensions = dataSources.map((ds: any, i: number) => {
    const snippet = (ds.extracted_data && ds.extracted_data.text) || ds.file_name || ds.source_url || ''
    return {
      title: `Review: ${snippet.toString().slice(0, 60) || ds.source_type || 'data'}`,
      description: snippet.toString().slice(0, 400),
      priority: i === 0 ? 'high' : 'medium',
    }
  })

  const tasks = tensions.map((t) => ({
    title: `Action: ${t.title}`,
    description: t.description,
    priority: t.priority || 'medium',
  }))

  return { summary: 'Stub summary', tensions, tasks }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()
    const { projectId, data_source_ids } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get project
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Ensure a Lead Agent exists for the project
    let { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('project_id', projectId)
      .eq('agent_type', 'lead')
      .limit(1)
      .single()

    if (!agent) {
      const created = await supabase
        .from('agents')
        .insert({
          project_id: projectId,
          agent_type: 'lead',
          name: 'Lead Agent',
          status: 'idle',
          configuration: {},
        })
        .select()
        .single()

      agent = created.data
    }

    // Fetch data sources
    let query = supabase.from('project_data_sources').select('*').eq('project_id', projectId)
    if (Array.isArray(data_source_ids) && data_source_ids.length > 0) {
      query = query.in('id', data_source_ids)
    } else {
      // default: unprocessed sources
      query = query.eq('processed', false)
    }

    const { data: dataSources } = await query

    const dsArray = dataSources || []

    // Prepare input for NeMo (or stub)
    const prepared = dsArray.map((ds: any) => ({
      id: ds.id,
      source_type: ds.source_type,
      file_name: ds.file_name,
      source_url: ds.source_url,
      extracted_data: ds.extracted_data || {},
      metadata: ds.metadata || {},
    }))

    let result: NeMoResult | null = null

    const nemoUrl = process.env.NEMO_API_URL
    if (nemoUrl) {
      try {
        const res = await fetch(`${nemoUrl}/lead/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: project, data_sources: prepared }),
        })
        if (res.ok) {
          result = await res.json()
        } else {
          console.warn('NeMo service responded with non-OK status, falling back to local stub')
        }
      } catch (err) {
        console.warn('NeMo service call failed, falling back to local stub', err)
      }
    }

    if (!result) {
      result = await runLocalStub(prepared)
    }

    // Insert tensions and tasks
    const createdTensions: any[] = []
    const createdTasks: any[] = []

    if (result.tensions && result.tensions.length > 0) {
      const tensionsPayload = result.tensions.map((t) => ({
        company_id: project.company_id,
        project_id: projectId,
        title: t.title,
        description: t.description || null,
        status: 'open',
        priority: t.priority || 'medium',
        detected_by_agent_id: agent?.id || null,
        metadata: {},
      }))

      const { data: tensionsData, error: tensionsError } = await supabase
        .from('tensions')
        .insert(tensionsPayload)
        .select()

      if (tensionsError) {
        console.error('Error inserting tensions:', tensionsError)
      } else if (tensionsData) {
        createdTensions.push(...tensionsData)
      }
    }

    if (result.tasks && result.tasks.length > 0) {
      const tasksPayload = result.tasks.map((t) => ({
        project_id: projectId,
        title: t.title,
        description: t.description || null,
        status: 'todo',
        priority: t.priority || 'medium',
        created_by: profile.id,
      }))

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksPayload)
        .select()

      if (tasksError) {
        console.error('Error inserting tasks:', tasksError)
      } else if (tasksData) {
        createdTasks.push(...tasksData)
      }
    }

    // Mark data sources as processed
    if (dsArray.length > 0) {
      const ids = dsArray.map((d: any) => d.id)
      await supabase
        .from('project_data_sources')
        .update({ processed: true, processing_status: 'completed' })
        .in('id', ids)
    }

    // Log agent activity
    await supabase.from('agent_activities').insert({
      agent_id: agent?.id,
      project_id: projectId,
      activity_type: 'run',
      description: `Lead Agent run by ${profile.id}`,
      data: { tensions_created: createdTensions.length, tasks_created: createdTasks.length },
    })

    return NextResponse.json({ tensions: createdTensions, tasks: createdTasks }, { status: 200 })
  } catch (error) {
    console.error('Lead agent run error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
