// lib/nemotronClient.ts
// Clean Nemotron client separate from legacy/duplicate file. Import this in new routes.

export type NemotronMessageContent = string | { type: 'text'; text: string } | { type: string; [k: string]: any }
export type NemotronMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: NemotronMessageContent }

export type NemotronOptions = {
  model: string
  messages: NemotronMessage[]
  temperature?: number
  top_p?: number
  max_tokens?: number
  frequency_penalty?: number
  presence_penalty?: number
  stream?: boolean
  extra_body?: Record<string, any>
}

const DEFAULT_API_BASE = process.env.NEMOTRON_API_BASE || 'https://integrate.api.nvidia.com/v1'

function getApiKeyForModel(model: string): string | undefined {
  const lower = model.toLowerCase()
  if (lower.includes('9b')) return process.env.NEMOTRON_ORCHESTRATOR_KEY
  if (lower.includes('12b')) return process.env.NEMOTRON_EXTRACTION_KEY
  return process.env.NEMOTRON_API_KEY
}

export async function nemotronChat(opts: NemotronOptions) {
  const {
    model,
    messages,
    temperature = 1,
    top_p = 1,
    max_tokens = 2048,
    frequency_penalty = 0,
    presence_penalty = 0,
    stream = false,
    extra_body = {},
  } = opts

  // Local mock mode
  if (process.env.NEMOTRON_MOCK === 'true') {
    if (model.includes('9b')) return { mock: true, model, output: 'orchestrator mock', messages }
    return { mock: true, model, output: 'extraction mock', entities: [] }
  }

  const apiKey = getApiKeyForModel(model)
  if (!apiKey) throw new Error(`Missing Nemotron API key for model: ${model}`)

  const url = `${DEFAULT_API_BASE}/chat/completions`
  const payload: any = { model, messages, temperature, top_p, max_tokens, frequency_penalty, presence_penalty, stream, ...extra_body }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Nemotron API error ${res.status}: ${txt}`)
  }

  if (!stream) return res.json()
  return res.body
}

export function systemMessage(content: NemotronMessageContent): NemotronMessage {
  return { role: 'system', content }
}

export function userMessage(content: NemotronMessageContent): NemotronMessage {
  return { role: 'user', content }
}
