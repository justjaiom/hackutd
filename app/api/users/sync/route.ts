import { createClient } from '@/lib/supabase/server'
import { getSession } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { auth0Id, email, name, picture, nickname } = body

    if (!auth0Id || !email) {
      return NextResponse.json(
        { error: 'Auth0 ID and email are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single()

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error } = await supabase
        .from('profiles')
        .update({
          email,
          full_name: name,
          picture,
          nickname,
          updated_at: new Date().toISOString(),
        })
        .eq('auth0_id', auth0Id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }

      return NextResponse.json({ user: updatedUser }, { status: 200 })
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('profiles')
        .insert({
          id: auth0Id, // Use Auth0 ID as primary key
          auth0_id: auth0Id,
          email,
          full_name: name,
          picture,
          nickname,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      return NextResponse.json({ user: newUser }, { status: 201 })
    }
  } catch (error) {
    console.error('Sync user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

