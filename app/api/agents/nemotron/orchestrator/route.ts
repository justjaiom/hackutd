import { NextResponse } from 'next/server'
import { nemotronChat, systemMessage, userMessage } from '@/lib/nemotronClient'

// The orchestrator accepts either a plain `input` string or a structured payload
// containing company, knowledge hub, and meetings data. It concatenates them into
// a single context blob so the orchestrator model holds the full project context.
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Accept either { input: string } or structured fields
    const inputStr = (() => {
      if (typeof body?.input === 'string' && body.input.trim().length > 0) return body.input
      const parts: string[] = []
      if (body?.projectId) parts.push(`PROJECT_ID: ${body.projectId}`)
      if (body?.company) parts.push(`COMPANY:\n${typeof body.company === 'string' ? body.company : JSON.stringify(body.company, null, 2)}`)
      if (body?.knowledge) parts.push(`KNOWLEDGE_HUB:\n${typeof body.knowledge === 'string' ? body.knowledge : JSON.stringify(body.knowledge, null, 2)}`)
      if (body?.meetings) parts.push(`MEETINGS_AND_COMMS:\n${typeof body.meetings === 'string' ? body.meetings : JSON.stringify(body.meetings, null, 2)}`)
      if (body?.files) parts.push(`FILES:\n${JSON.stringify(body.files || [], null, 2)}`)
      return parts.join('\n\n')
    })()

    if (!inputStr) return NextResponse.json({ error: 'input or structured context required' }, { status: 400 })

    const messages = [systemMessage('/think'), userMessage(inputStr)]

    const resp = await nemotronChat({ model: 'nvidia/nemotron-nano-9b-v2', messages, temperature: 0.6, top_p: 0.95, max_tokens: 2048, extra_body: { min_thinking_tokens: 1024, max_thinking_tokens: 2048 } })

    return NextResponse.json({ ok: true, model: '9b', result: resp })
  } catch (err: any) {
    console.error('orchestrator error', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
