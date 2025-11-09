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

// NVIDIA Build API uses this base URL for their catalog models
const DEFAULT_API_BASE = process.env.NEMOTRON_API_BASE || 'https://integrate.api.nvidia.com/v1'

function getApiKeyForModel(model: string): string | undefined {
  const lower = model.toLowerCase()
  // Match both old and new model names
  if (lower.includes('9b')) return process.env.NEMOTRON_ORCHESTRATOR_KEY
  if (lower.includes('12b')) return process.env.NEMOTRON_EXTRACTION_KEY
  return process.env.NEMOTRON_API_KEY
}

// Get the invoke URL for specific NVIDIA models
function getInvokeUrl(model: string): string {
  // All NVIDIA Build models use the same base URL
  return `https://integrate.api.nvidia.com/v1/chat/completions`
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

  const url = getInvokeUrl(model)
  const payload: any = { model, messages, temperature, top_p, max_tokens, frequency_penalty, presence_penalty, stream, ...extra_body }

  console.log(`[Nemotron] Calling API:`, { url, model, apiKeyPrefix: apiKey.substring(0, 10) + '...' })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const txt = await res.text()
    console.error(`[Nemotron] API Error:`, { status: res.status, url, model, response: txt })
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
