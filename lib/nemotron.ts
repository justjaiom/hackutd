// lib/nemotron.ts
// Clean Nemotron client with mock-mode for local testing.

export type NemotronMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string }

type CompletionOptions = {
  model: string
  messages: NemotronMessage[]
  temperature?: number
  max_tokens?: number
}

function getApiKeyForModel(model: string): string | undefined {
  const lower = model.toLowerCase()
  if (lower.includes('9b')) return process.env.NEMOTRON_ORCHESTRATOR_KEY
  if (lower.includes('12b')) return process.env.NEMOTRON_EXTRACTION_KEY
  return process.env.NEMOTRON_API_KEY
}

export async function nemotronCompletion(opts: CompletionOptions) {
  const { model, messages, temperature = 0.2, max_tokens = 500 } = opts

  // Local mock mode
  if (process.env.NEMOTRON_MOCK === 'true') {
    if (model.includes('9b')) {
      return { mock: true, model, messages, instructions: { next: 'extraction', reason: 'mocked' } }
    }
    return {
      mock: true,
      model,
      messages,
      entities: [
        { title: 'Develop landing page', owner: 'Jordan', area: 'frontend' },
        { title: 'Implement onboarding', owner: 'TMA 3', area: 'frontend' },
        { title: 'Backend: Nemotron integration', owner: 'Teammate 2', area: 'backend' },
      ],
    }
  }

  const apiKey = getApiKeyForModel(model)
  if (!apiKey) throw new Error(`Missing Nemotron API key for model: ${model}. Set the appropriate env var.`)

  const base = process.env.NEMOTRON_API_BASE || 'https://api.nvidia.com/v1'
  const url = `${base}/${model}/completions`

  const payload = { model, messages, temperature, max_tokens }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Nemotron API error ${res.status}: ${text}`)
  }

  return res.json()
}

export function systemMessage(content: string): NemotronMessage {
  return { role: 'system', content }
}

export function userMessage(content: string): NemotronMessage {
  return { role: 'user', content }
}
// Lightweight Nemotron client helper with an optional mock mode for local dev.
// Usage:
// - Set NEMOTRON_MOCK=true in .env.local to return canned responses for testing
// - Otherwise set NEMOTRON_ORCHESTRATOR_KEY and NEMOTRON_EXTRACTION_KEY

export type NemotronMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string }

type CompletionOptions = {
  model: string
  messages: NemotronMessage[]
  temperature?: number
  max_tokens?: number
}

function getApiKeyForModel(model: string): string | undefined {
  const lower = model.toLowerCase()
  if (lower.includes('9b')) return process.env.NEMOTRON_ORCHESTRATOR_KEY
  if (lower.includes('12b')) return process.env.NEMOTRON_EXTRACTION_KEY
  return process.env.NEMOTRON_API_KEY
}

export async function nemotronCompletion(opts: CompletionOptions) {
  const { model, messages, temperature = 0.2, max_tokens = 500 } = opts

  // Mock mode: safe for local dev without API keys
  if (process.env.NEMOTRON_MOCK === 'true') {
    if (model.includes('9b')) {
      return { mock: true, model, messages, instructions: { next: 'extraction', reason: 'mocked' } }
    }
    return {
      mock: true,
      model,
      messages,
      entities: [
        { title: 'Develop landing page', owner: 'Jordan', area: 'frontend' },
        { title: 'Implement onboarding', owner: 'TMA 3', area: 'frontend' },
        { title: 'Backend: Nemotron integration', owner: 'Teammate 2', area: 'backend' },
      ],
    }
  }

  const apiKey = getApiKeyForModel(model)
  if (!apiKey) throw new Error(`Missing Nemotron API key for model: ${model}. Set the appropriate env var.`)

  const base = process.env.NEMOTRON_API_BASE || 'https://api.nvidia.com/v1'
  const url = `${base}/${model}/completions`

  const payload = { model, messages, temperature, max_tokens }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Nemotron API error ${res.status}: ${text}`)
  }

  return res.json()
}

export function systemMessage(content: string): NemotronMessage {
  return { role: 'system', content }
}

export function userMessage(content: string): NemotronMessage {
  return { role: 'user', content }
}
export type NemotronMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string }

type CompletionOptions = {
  model: string
  messages: NemotronMessage[]
  temperature?: number
  max_tokens?: number
}

function getApiKeyForModel(model: string): string | undefined {
  const lower = model.toLowerCase()
  if (lower.includes('9b')) return process.env.NEMOTRON_ORCHESTRATOR_KEY
  if (lower.includes('12b')) return process.env.NEMOTRON_EXTRACTION_KEY
  return process.env.NEMOTRON_API_KEY
}

export async function nemotronCompletion(opts: CompletionOptions) {
  const { model, messages, temperature = 0.2, max_tokens = 500 } = opts

  // Mock mode for local dev: set NEMOTRON_MOCK=true in .env.local
  if (process.env.NEMOTRON_MOCK === 'true') {
    // Basic canned responses to let you test the flow locally
    if (model.includes('9b')) {
      return {
        mock: true,
        model,
        messages,
        output: `Orchestrator mock: recommend calling extraction for 1 chunk`,
        instructions: { next: 'extraction', reason: 'found tasks and owners' },
      }
    }
    return {
      mock: true,
      model,
      messages,
      output: `Extraction mock: found 3 tasks`,
      entities: [
        { title: 'Develop landing page', owner: 'Jordan', area: 'frontend' },
        { title: 'Implement onboarding', owner: 'TMA 3', area: 'frontend' },
        { title: 'Backend: Nemotron integration', owner: 'Teammate 2', area: 'backend' },
      ],
    }
  }

  const apiKey = getApiKeyForModel(model)
  if (!apiKey) throw new Error(`Missing Nemotron API key for model: ${model}. Set the appropriate env var.`)

  const base = process.env.NEMOTRON_API_BASE || 'https://api.nvidia.com/v1'
  const url = `${base}/${model}/completions`

  const payload = { model, messages, temperature, max_tokens }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Nemotron API error ${res.status}: ${text}`)
  }

  return res.json()
}

export function systemMessage(content: string): NemotronMessage {
  return { role: 'system', content }
}

export function userMessage(content: string): NemotronMessage {
  return { role: 'user', content }
}
declare const process: any

export type NemotronMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
}

type CompletionOptions = {
  model: string
  messages: NemotronMessage[]
  temperature?: number
  max_tokens?: number
}

const DEFAULT_API_BASE = process.env.NEMOTRON_API_BASE || 'https://api.nvidia.com/v1'

function getApiKeyForModel(model: string): string | undefined {
  const lower = model.toLowerCase()
  if (lower.includes('9b')) return process.env.NEMOTRON_ORCHESTRATOR_KEY
  if (lower.includes('12b')) return process.env.NEMOTRON_EXTRACTION_KEY
  return process.env.NEMOTRON_API_KEY
}

export async function nemotronCompletion(opts: CompletionOptions) {
  const { model, messages, temperature = 0.2, max_tokens = 500 } = opts
  const apiKey = getApiKeyForModel(model)
  if (!apiKey) throw new Error(`Missing Nemotron API key for model: ${model}. Set the appropriate env var.`)

  const url = `${DEFAULT_API_BASE}/${model}/completions`
  const payload = { model, messages, temperature, max_tokens }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Nemotron API error ${res.status}: ${text}`)
  }

  return res.json()
}

export function systemMessage(content: string): NemotronMessage {
  return { role: 'system', content }
}

export function userMessage(content: string): NemotronMessage {
  return { role: 'user', content }
}
// In Next.js server runtime process.env is available. Add a minimal declaration
// to avoid TS errors in environments without Node types installed.
declare const process: any

export type NemotronMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
}

type CompletionOptions = {
  model: string
  messages: NemotronMessage[]
  temperature?: number
  max_tokens?: number
}

const DEFAULT_API_BASE = process.env.NEMOTRON_API_BASE || 'https://api.nvidia.com/v1'

function getApiKeyForModel(model: string): string | undefined {
  // Map models to environment variables. Keep this mapping easy to extend.
  const lower = model.toLowerCase()
  if (lower.includes('9b')) return process.env.NEMOTRON_ORCHESTRATOR_KEY
  if (lower.includes('12b')) return process.env.NEMOTRON_EXTRACTION_KEY
  // fallback single key (optional)
  return process.env.NEMOTRON_API_KEY
}

export async function nemotronCompletion(opts: CompletionOptions) {
  const { model, messages, temperature = 0.2, max_tokens = 500 } = opts
  const apiKey = getApiKeyForModel(model)
  if (!apiKey) throw new Error(`Missing Nemotron API key for model: ${model}. Set the appropriate env var.`)

  const url = `${DEFAULT_API_BASE}/${model}/completions`

  const payload = {
    model,
    messages,
    temperature,
    max_tokens,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Nemotron API error ${res.status}: ${text}`)
  }

  // Return parsed JSON. Shape depends on Nemotron API, forward as-is for now.
  return res.json()
}

// Small helper to build messages easily
export function systemMessage(content: string): NemotronMessage {
  return { role: 'system', content }
}

export function userMessage(content: string): NemotronMessage {
  return { role: 'user', content }
}
