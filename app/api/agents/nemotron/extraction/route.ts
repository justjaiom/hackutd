import { NextResponse } from 'next/server'
import { nemotronChat, systemMessage, userMessage } from '@/lib/nemotronClient'

// Supported media types mapping (keep small; accept data URIs or URLs)
const VIDEO_HINT = ['.mp4', '.webm', '.mov']

function looksLikeVideo(urlOrData: string) {
  const low = urlOrData.toLowerCase()
  if (low.startsWith('data:') && low.includes('video')) return true
  return VIDEO_HINT.some((ext) => low.endsWith(ext))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = body?.input || ''
    const media: string[] = body?.media || []

    if (!input && media.length === 0) return NextResponse.json({ error: 'input or media required' }, { status: 400 })

    const hasVideo = media.some(looksLikeVideo)
  const system = hasVideo ? '/no_think' : '/think'

  // Instruction to the extraction model: remove fluff and return structured entities
  const extractionInstruction = `Extract actionable items and structured entities from the given content. Filter out conversational fluff, filler, and irrelevant material (e.g., small talk, salutations). Return a JSON object with an array named \"entities\" containing objects with fields: type (objective|deliverable|blocker|owner|deadline|note), text, confidence (optional), and metadata (optional). Only output valid JSON.`

  let content: any
    if (media.length === 0) {
      content = input
    } else {
      // build array: text followed by media objects
      content = [{ type: 'text', text: input }]
      for (const m of media) {
        // For data URIs or urls, let the model infer the mime; forward as media_url/data
        const lower = m.toLowerCase()
        const isData = lower.startsWith('data:')
        const mediaObj: any = {}
        if (isData) {
          // attach as image_url or video_url depending on content
          if (m.includes('video')) {
            mediaObj.type = 'video_url'
            mediaObj.video_url = { url: m }
          } else {
            mediaObj.type = 'image_url'
            mediaObj.image_url = { url: m }
          }
        } else {
          // treat as remote URL
          if (looksLikeVideo(m)) {
            mediaObj.type = 'video_url'
            mediaObj.video_url = { url: m }
          } else {
            mediaObj.type = 'image_url'
            mediaObj.image_url = { url: m }
          }
        }
        content.push(mediaObj)
      }
    }

  const messages = [systemMessage(system), userMessage(extractionInstruction), userMessage(content as any)]

  const resp = await nemotronChat({ model: 'nvidia/nemotron-nano-12b-v2-vl', messages, temperature: 0.8, max_tokens: 4096 })

    return NextResponse.json({ ok: true, model: '12b-vl', result: resp })
  } catch (err: any) {
    console.error('extraction error', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
