import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Create response with cleared cookies
    const response = NextResponse.json(
      { message: 'Signed out successfully' },
      { status: 200 }
    )

    // Clear all potential Supabase auth cookies
    // The actual cookie names depend on your Supabase project configuration
    const cookiesToClear = [
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token.0`,
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token.1`,
      'supabase-auth-token',
      'supabase.auth.token',
      'sb-access-token',
      'sb-refresh-token'
    ]

    cookiesToClear.forEach(cookieName => {
      if (cookieName) {
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }
    })

    return response
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

