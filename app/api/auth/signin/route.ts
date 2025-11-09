import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[api/auth/signin] POST handler invoked')
    const { email, password } = await request.json()

    console.log('[api/auth/signin] received payload', { email: email?.slice(0,3) + '***' })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('[api/auth/signin] signInWithPassword result', {
      user: data?.user ? { id: data.user.id } : null,
      session: !!data?.session,
      error: error?.message,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        user: data.user,
        session: data.session,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

