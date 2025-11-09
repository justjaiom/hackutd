export async function GET() {
  const body = { ok: true, timestamp: new Date().toISOString() }
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })
}
export async function GET() {
  const body = { ok: true, timestamp: new Date().toISOString() }
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })
}
