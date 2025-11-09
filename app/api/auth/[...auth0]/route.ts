import { NextResponse } from 'next/server'

// Placeholder catch-all auth route removed to avoid runtime issues with the Auth0 package exports.
// If you intend to use Auth0, replace this with the official handlers or a custom implementation.
export async function GET(request: Request) {
  return NextResponse.json({ message: 'Auth route placeholder' }, { status: 200 })
}
export async function POST(request: Request) {
  return NextResponse.json({ message: 'Auth route placeholder' }, { status: 200 })
}
export async function PUT(request: Request) {
  return NextResponse.json({ message: 'Auth route placeholder' }, { status: 200 })
}
export async function DELETE(request: Request) {
  return NextResponse.json({ message: 'Auth route placeholder' }, { status: 200 })
}

