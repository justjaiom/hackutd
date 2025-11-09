import { NextResponse } from 'next/server'
import { nemotronChat, systemMessage, userMessage } from '@/lib/nemotronClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = body?.input || ''
    if (!input) return NextResponse.json({ error: 'input required' }, { status: 400 })

    const messages = [systemMessage('/think'), userMessage(input)]

    const resp = await nemotronChat({ model: 'nvidia/nemotron-nano-9b-v2', messages, temperature: 0.6, top_p: 0.95, max_tokens: 2048, extra_body: { min_thinking_tokens: 1024, max_thinking_tokens: 2048 } })

    return NextResponse.json({ ok: true, model: '9b', result: resp })
  } catch (err: any) {
    console.error('orchestrator error', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
