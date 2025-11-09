import { NextResponse } from 'next/server'
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
    const { projectId, data_source_ids } = body

    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

    // Get user profile using Supabase user ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (!profile || profileError) {
      console.error('Profile lookup error:', profileError)
      return NextResponse.json({ 
        error: 'User profile not found. Please refresh the page and try again.',
        details: profileError?.message 
      }, { status: 404 })
    }

    // Get project
    const { data: project, error: projectError } = await supabase.from('projects').select('*').eq('id', projectId).single()
    if (!project || projectError) {
      console.error('Project lookup error:', projectError)
      return NextResponse.json({ 
        error: 'Project not found',
        details: projectError?.message 
      }, { status: 404 })
    }

    // Fetch data sources
    // Note: We fetch ALL data sources (not just unprocessed) to allow re-running the agent
    let query = supabase.from('project_data_sources').select('*').eq('project_id', projectId)
    if (Array.isArray(data_source_ids) && data_source_ids.length > 0) {
      query = query.in('id', data_source_ids)
    }
    // Removed the .eq('processed', false) filter to allow reprocessing
    const { data: dataSources } = await query
    const dsArray = dataSources || []

    // Check if there are data sources to process
    if (dsArray.length === 0) {
      console.log('No data sources found for project:', projectId)
      return NextResponse.json({ 
        ok: true, 
        tasks: [],
        message: 'No data sources found. Please add documents, repositories, or recordings to the Knowledge Hub first.'
      })
    }

    // Build full context: company, knowledge hub items, meetings, and file snippets
    const companyContext = project.company_id ? `Company ID: ${project.company_id}` : ''
    
    // Build rich context from data sources
    const filesContext = dsArray.map((d: any) => {
      const hasExtractedData = d.extracted_data && Object.keys(d.extracted_data).length > 0
      return {
        id: d.id,
        source_type: d.source_type,
        file_name: d.file_name,
        source_url: d.source_url,
        metadata: d.metadata || {},
        // Include extracted data if available
        ...(hasExtractedData ? { extracted_content: d.extracted_data } : {}),
        // Add helpful context about what this file might contain
        note: hasExtractedData 
          ? 'Content available - see extracted_content field'
          : 'File uploaded but content not yet extracted. AI should make reasonable assumptions about what this file likely contains based on filename and type.'
      }
    })
    
    const fullContext = [
      companyContext,
      `PROJECT NAME: ${project.name || 'Untitled'}`,
      `PROJECT DESCRIPTION: ${project.description || 'No description'}`,
      `PROJECT CONTEXT: ${project.metadata?.context || 'No additional context'}`,
      `\nDATA SOURCES (${filesContext.length} files):`,
      JSON.stringify(filesContext, null, 2)
    ].filter(Boolean).join('\n\n')
    
    // Log what we're sending to the AI for debugging
    console.log('[Pipeline] Context being sent to AI:', {
      projectName: project.name,
      hasDescription: !!project.description,
      hasContext: !!(project.metadata?.context),
      dataSourceCount: filesContext.length,
      dataSourcesWithContent: filesContext.filter((f: any) => f.extracted_content).length,
      filesContextPreview: filesContext.map((f: any) => ({ 
        name: f.file_name, 
        hasContent: !!f.extracted_content 
      }))
    })

    // If mock mode, use local stub
    if (process.env.NEMOTRON_MOCK === 'true') {
      const stub = await runLocalStub(project, supabase, profile.id)
      return NextResponse.json({ ok: true, mock: true, tasks: stub.tasks })
    }

    // 1) Orchestrator: ask for actions based on full context
    const orchesMessages = [
      systemMessage('/think'), 
      userMessage(`You are analyzing a project with the following data sources and context:

PROJECT: ${project.name || 'Untitled Project'}
DESCRIPTION: ${project.description || 'No description provided'}
CONTEXT: ${project.metadata?.context || 'No additional context'}

DATA SOURCES:
${fullContext}

Based on this information, identify concrete ACTION ITEMS that the team should work on. Focus on:
- Specific deliverables and milestones
- Technical implementation tasks
- Research and analysis work
- Strategic decisions that need to be made
- Customer feedback that needs to be addressed
- Product features to develop or improve

Output a JSON object with this structure: { "actions": [ ... ] } where each action is { "type": "plan", "text": "Brief description of what needs to be done" }.`)
    ]
    const orchesResp = await nemotronChat({ 
      model: 'nvidia/nvidia-nemotron-nano-9b-v2', 
      messages: orchesMessages, 
      temperature: 0.6, 
      max_tokens: 2048,
      extra_body: {
        min_thinking_tokens: 1024,
        max_thinking_tokens: 2048
      }
    })
    const instructions = extractJsonFromResponse(orchesResp)

    // Skip extraction step for now and go straight to planning with the full context
    // This avoids media processing issues with the vision model
    const extractedResults: any[] = [{
      text: fullContext,
      parsed: { summary: 'Data from project sources', items: filesContext }
    }]

    // Optional: If instructions have text-only extraction actions, process them
    // if (instructions && Array.isArray(instructions.actions)) {
    //   for (const act of instructions.actions) {
    //     if (act.type === 'extract' && act.text && !act.media?.length) {
    //       // Only process text-only extractions
    //       extractedResults.push({ text: act.text, parsed: { content: act.text } })
    //     }
    //   }
    // }

    // 2) Planning: send extractedResults to planning model and get tasks
    const planningInstruction = `You are an expert AI project manager with deep domain knowledge. Your job is to create ACTIONABLE, SPECIFIC TASKS by intelligently inferring what needs to be done based on limited information.

CRITICAL SKILL: INTELLIGENT INFERENCE
Even without full file content, you MUST infer meaningful tasks from:
- Filenames reveal intent: "research_developments.pdf" → research findings need implementation
- File types reveal purpose: .pptx = strategy presentation, .xlsx = data analysis, .mp4 = meeting/demo, .txt = transcript
- Project context reveals goals: Use the project description to understand what matters
- Business logic: If there's a "customer_feedback" file → create tasks to address customer needs

TASK CREATION RULES:
1. NEVER create "review", "analyze", "download", or "extract" tasks
2. ALWAYS create implementation-focused tasks
3. Make reasonable assumptions about file contents based on naming
4. Be specific and actionable - include WHO, WHAT, WHY
5. Connect tasks to business outcomes

INFERENCE EXAMPLES:

If you see "customer_feedback.txt":
❌ BAD: "Review customer_feedback.txt"
✅ GOOD: "Address top 3 customer pain points identified in feedback survey"
✅ GOOD: "Implement feature requests from customer interviews"

If you see "competitive_analysis.pptx":
❌ BAD: "Analyze competitive_analysis.pptx"
✅ GOOD: "Develop counter-strategy for competitor threats identified in market analysis"
✅ GOOD: "Implement feature parity with top 2 competitors"

If you see "Q4_roadmap.xlsx":
❌ BAD: "Review Q4_roadmap.xlsx"
✅ GOOD: "Execute Q4 product milestones - prioritize high-impact features"
✅ GOOD: "Allocate engineering resources for Q4 deliverables"

If you see "executive_meeting.mp4":
❌ BAD: "Watch executive_meeting.mp4"
✅ GOOD: "Execute action items from executive strategy meeting"
✅ GOOD: "Implement decisions from leadership team discussion"

If you see "technical_architecture.pdf":
❌ BAD: "Read technical_architecture.pdf"
✅ GOOD: "Implement scalability improvements outlined in architecture design"
✅ GOOD: "Refactor system based on architectural recommendations"

TASK STRUCTURE:
- title: Action verb + specific deliverable (15-80 chars)
- description: Business value + success criteria (50-200 chars)
- priority: 
  * urgent = blocking/deadline < 1 week
  * high = critical business impact
  * medium = important but not urgent
  * low = nice-to-have
- owner: (optional) role like "Engineering", "Product", "Sales"
- due_date: (optional) only if specific deadline mentioned

OUTPUT: JSON array only, no explanations.`
    const planningContentText = JSON.stringify(extractedResults.map((r) => r.parsed || r.raw), null, 2)
    const planMsgs = [systemMessage('/think'), userMessage(planningInstruction), userMessage(`DATA TO ANALYZE:\n${planningContentText}`)]
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

    // Validate and normalize priority values
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    const normalizedTasks = parsedTasks.map((t: any) => {
      let priority = (t.priority || 'medium').toLowerCase()
      if (!validPriorities.includes(priority)) {
        priority = 'medium'
      }
      return {
        project_id: projectId,
        title: t.title || t.name || 'Untitled task',
        description: t.description || null,
        status: 'todo',
        priority,
        created_by: profile.id,
        metadata: { source: 'pipeline-planning', raw_data: t }
      }
    })

    const { data: tasksData, error: tasksError } = await supabase.from('tasks').insert(normalizedTasks).select()
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
