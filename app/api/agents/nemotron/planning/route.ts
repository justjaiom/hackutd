import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nemotronChat, systemMessage, userMessage } from '@/lib/nemotronClient'

type ExtractedEntity = any

function extractJsonFromResponse(respBody: any): any | null {
  // Try common shapes: choices[0].message.content, choices[0].text, output
  const candidates: string[] = []
  if (!respBody) return null
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
    // Try to find JSON array/object inside
    const jsonMatch = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (e) {
        // continue
      }
    }
    // Try parsing full string
    try {
      return JSON.parse(trimmed)
    } catch (e) {
      // continue
    }
  }
  return null
}

function validateTasksArray(arr: any): arr is any[] {
  if (!Array.isArray(arr)) return false
  for (const it of arr) {
    if (!it || typeof it !== 'object') return false
    if (!it.title || typeof it.title !== 'string') return false
    // description optional, priority optional
  }
  return true
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, extractedData } = body

    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    // Get user profile using Supabase user ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (!profile) return NextResponse.json({ error: 'User profile not found' }, { status: 404 })

    // Validate project exists
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Build prompt for planning
    const system = systemMessage(`/think`)
    const instruction = `You are a project planning assistant. Given extracted structured data (entities, tasks, objectives, owners, deadlines) produce a JSON array named \"tasks\" where each task has: title, description (optional), priority (low|medium|high|urgent), owner (optional), due_date (optional, ISO date or null). Only output valid JSON (an array of objects). Use the extracted data to create concrete, actionable to-do items suitable for insertion into a project's kanban board. Do not include extraneous explanation.`

    const userContent = {
      type: 'text',
      text: `EXTRACTED_DATA:\n${JSON.stringify(extractedData || [], null, 2)}\n\nGenerate tasks as described.`,
    }

    const messages = [system, userMessage(instruction), userMessage(userContent)]

    // Mock mode
    if (process.env.NEMOTRON_MOCK === 'true') {
      const mockTasks = [
        { title: 'Mock: Review extracted doc A', description: 'Review the extracted content', priority: 'medium', owner: null, due_date: null },
      ]
      // insert into tasks table
      const tasksPayload = mockTasks.map((t: any) => ({ project_id: projectId, title: t.title, description: t.description || null, status: 'todo', priority: t.priority || 'medium', created_by: profile.id }))
      const { data: tasksData, error: tasksError } = await supabase.from('tasks').insert(tasksPayload).select()
      if (tasksError) console.error('Error inserting mock tasks:', tasksError)
      return NextResponse.json({ ok: true, model: '12b-vl', tasks: tasksData || mockTasks })
    }

    const resp = await nemotronChat({ model: 'nvidia/nemotron-nano-12b-v2-vl', messages, temperature: 0.7, max_tokens: 1024 })

    // Attempt to extract JSON
    let parsed = extractJsonFromResponse(resp)
    // Try up to 3 attempts: original + up to 2 re-prompts with stricter instruction
    let attempts = 0
    const maxAttempts = 3
    let lastResp: any = resp
    while (attempts < maxAttempts) {
      if (parsed && validateTasksArray(parsed)) break
      // prepare stricter prompt
      const retryInstruction = attempts === 0
        ? `Return ONLY the JSON array of tasks (no surrounding text). The array should contain objects with fields: title, description, priority, owner, due_date.`
        : `You must output a valid JSON array only. No explanation. Each element must have a title string. If you cannot, return []` 
      const retryMsgs = [system, userMessage(retryInstruction), userMessage(userContent)]
      const retryResp = await nemotronChat({ model: 'nvidia/nemotron-nano-12b-v2-vl', messages: retryMsgs, temperature: 0.0, max_tokens: 1024 })
      lastResp = retryResp
      parsed = extractJsonFromResponse(retryResp)
      attempts++
    }
    if (!parsed || !validateTasksArray(parsed)) {
      return NextResponse.json({ error: 'Could not parse tasks JSON from model response', modelOutput: lastResp }, { status: 502 })
    }

    // Map to task payloads and insert
    const tasksPayload = parsed.map((t: any) => ({
      project_id: projectId,
      title: t.title || t.name || 'Untitled task',
      description: t.description || null,
      status: 'todo',
      priority: t.priority || 'medium',
      created_by: profile.id,
      metadata: { source: 'planning-agent' },
    }))

    const { data: tasksData, error: tasksError } = await supabase.from('tasks').insert(tasksPayload).select()
    if (tasksError) {
      console.error('Error inserting tasks:', tasksError)
      return NextResponse.json({ error: 'DB insert failed', details: tasksError }, { status: 500 })
    }

    return NextResponse.json({ ok: true, model: '12b-vl', tasks: tasksData })
  } catch (error) {
    console.error('planning agent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
