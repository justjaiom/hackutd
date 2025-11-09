import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { createClient } from '@/lib/supabase/server'
import { nemotronChat, systemMessage, userMessage } from '@/lib/nemotronClient'

async function runLocalStub(project: any, supabase: any, profileId: string) {
  // Simple deterministic stub: create one task per unprocessed data source (placeholder behavior)
  const { data: dataSources } = await supabase.from('project_data_sources').select('*').eq('project_id', project.id).eq('processed', false)
  const dsArray = dataSources || []
  const tasksPayload = dsArray.map((ds: any, i: number) => ({
    project_id: project.id,
    title: `Stub Task: Review ${ds.file_name || ds.source_type || ds.source_url || 'data'}`,
    description: (ds.extracted_data && ds.extracted_data.text) || null,
    status: 'todo',
    priority: i === 0 ? 'high' : 'medium',
    created_by: profileId,
  }))

  const { data: tasksData } = await supabase.from('tasks').insert(tasksPayload).select()
  // mark processed
  if (dsArray.length > 0) {
    const ids = dsArray.map((d: any) => d.id)
    await supabase.from('project_data_sources').update({ processed: true, processing_status: 'completed' }).in('id', ids)
  }

  return { tasks: tasksData || [] }
}

function extractJsonFromResponse(respBody: any): any | null {
  if (!respBody) return null
  const candidates: string[] = []
  try {
    if (typeof respBody === 'string') candidates.push(respBody)
    if (respBody.output && typeof respBody.output === 'string') candidates.push(respBody.output)
    if (Array.isArray(respBody.choices) && respBody.choices[0]) {
      const ch = respBody.choices[0]
      if (ch.message && typeof ch.message.content === 'string') candidates.push(ch.message.content)
      if (typeof ch.text === 'string') candidates.push(ch.text)
      if (typeof ch.content === 'string') candidates.push(ch.content)
    }
  } catch (e) {
    // ignore
  }
  for (const c of candidates) {
    const trimmed = c.trim()
    const jsonMatch = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (e) {
        // continue
      }
    }
    try {
      return JSON.parse(trimmed)
    } catch (e) {
      // continue
    }
  }
  return null
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const body = await request.json()
    const { projectId, data_source_ids } = body

    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    // Get user profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('auth0_id', session.user.sub).single()
    if (!profile) return NextResponse.json({ error: 'User profile not found' }, { status: 404 })

    // Get project
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Fetch data sources (same as lead/run)
    let query = supabase.from('project_data_sources').select('*').eq('project_id', projectId)
    if (Array.isArray(data_source_ids) && data_source_ids.length > 0) query = query.in('id', data_source_ids)
    else query = query.eq('processed', false)
    const { data: dataSources } = await query
    const dsArray = dataSources || []

    // Build full context: company, knowledge hub items, meetings, and file snippets
    const companyContext = project.company_id ? `Company ID: ${project.company_id}` : ''
    const filesContext = dsArray.map((d: any) => ({ id: d.id, source_type: d.source_type, file_name: d.file_name, source_url: d.source_url, extracted: d.extracted_data || {} }))
    const fullContext = [companyContext, JSON.stringify(filesContext, null, 2)].filter(Boolean).join('\n\n')

    // If mock mode, use local stub
    if (process.env.NEMOTRON_MOCK === 'true') {
      const stub = await runLocalStub(project, supabase, profile.id)
      return NextResponse.json({ ok: true, mock: true, tasks: stub.tasks })
    }

    // 1) Orchestrator: ask for actions based on full context
    const orchesMessages = [systemMessage('/think'), userMessage(`FULL_CONTEXT:\n${fullContext}\n\nPlease output a JSON object { "actions": [ ... ] } where each action is { "type": "extract" | "plan", "text": "...", "media": [optional array of urls or data URIs] }.`) ]
    const orchesResp = await nemotronChat({ model: 'nvidia/nemotron-nano-9b-v2', messages: orchesMessages, temperature: 0.6, max_tokens: 2048 })
    const instructions = extractJsonFromResponse(orchesResp)

    const extractedResults: any[] = []

    if (instructions && Array.isArray(instructions.actions)) {
      for (const act of instructions.actions) {
        if (act.type === 'extract') {
          // call extraction model directly
          const media: string[] = Array.isArray(act.media) ? act.media : []
          const hasVideo = media.some((m) => (typeof m === 'string' && (m.startsWith('data:') ? m.includes('video') : m.match(/\.(mp4|webm|mov)$/i))))
          const system = hasVideo ? '/no_think' : '/think'
          const extractionInstr = `Extract actionable items and structured entities from the following content. Return JSON: { "entities": [ ... ] }.`
          const content: any[] = [{ type: 'text', text: act.text || '' }]
          for (const m of media) {
            const lower = (m || '').toString().toLowerCase()
            if (lower.startsWith('data:')) {
              if (lower.includes('video')) content.push({ type: 'video_url', video_url: { url: m } })
              else content.push({ type: 'image_url', image_url: { url: m } })
            } else {
              if (lower.match(/\.(mp4|webm|mov)$/i)) content.push({ type: 'video_url', video_url: { url: m } })
              else content.push({ type: 'image_url', image_url: { url: m } })
            }
          }
          const msgs = [systemMessage(system), userMessage(extractionInstr), userMessage(content as any)]
          const extResp = await nemotronChat({ model: 'nvidia/nemotron-nano-12b-v2-vl', messages: msgs, temperature: 0.8, max_tokens: 4096 })
          const parsed = extractJsonFromResponse(extResp)
          extractedResults.push({ action: act, raw: extResp, parsed })
        }
      }
    }

    // 2) Planning: send extractedResults to planning model and get tasks
    const planningInstruction = `You are a project planning assistant. Given the following extracted entities (array), produce a JSON array named "tasks" where each task has: title, description, priority (low|medium|high|urgent), owner (optional), due_date (ISO or null). Output only the JSON array.`
    const planningContent = { type: 'text', text: JSON.stringify(extractedResults.map((r) => r.parsed || r.raw), null, 2) }
    const planMsgs = [systemMessage('/think'), userMessage(planningInstruction), userMessage(planningContent)]
    // Try planning with up to 3 attempts and validation
    let planResp: any = null
    let parsedTasks: any = null
    const maxPlanAttempts = 3
    for (let attempt = 0; attempt < maxPlanAttempts; attempt++) {
      planResp = await nemotronChat({ model: 'nvidia/nemotron-nano-12b-v2-vl', messages: planMsgs, temperature: attempt === 0 ? 0.7 : 0.0, max_tokens: 1024 })
      parsedTasks = extractJsonFromResponse(planResp)
      if (parsedTasks && Array.isArray(parsedTasks) && parsedTasks.every((t: any) => t && typeof t.title === 'string')) break
      // tighten the prompt for next attempt
      planMsgs[1] = userMessage('Return ONLY the JSON array of tasks. No surrounding text. Each item must have a title string.')
    }
    if (!parsedTasks || !Array.isArray(parsedTasks)) {
      return NextResponse.json({ error: 'Planning model did not return parsable tasks', modelOutput: planResp, extractedResults }, { status: 502 })
    }

    const tasksPayload = parsedTasks.map((t: any) => ({ project_id: projectId, title: t.title || t.name || 'Untitled task', description: t.description || null, status: 'todo', priority: t.priority || 'medium', created_by: profile.id, metadata: { source: 'pipeline-planning' } }))
    const { data: tasksData, error: tasksError } = await supabase.from('tasks').insert(tasksPayload).select()
    if (tasksError) {
      console.error('Error inserting pipeline tasks:', tasksError)
      return NextResponse.json({ error: 'DB insert failed', details: tasksError }, { status: 500 })
    }

    // mark data sources processed
    if (dsArray.length > 0) {
      const ids = dsArray.map((d: any) => d.id)
      await supabase.from('project_data_sources').update({ processed: true, processing_status: 'completed' }).in('id', ids)
    }

    // log activity
    await supabase.from('agent_activities').insert({ agent_id: null, project_id: projectId, activity_type: 'pipeline_run', description: `Orchestrator->Extraction->Planning run by ${profile.id}`, data: { tasks_created: tasksData.length } })

    return NextResponse.json({ ok: true, tasks: tasksData, extracted: extractedResults })
  } catch (error) {
    console.error('run-pipeline error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
