import { getSession } from '@auth0/nextjs-auth0'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get user's companies
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', profile.id)

    if (!companies || companies.length === 0) {
      return NextResponse.json({ projects: [] }, { status: 200 })
    }

    const companyIds = companies.map(c => c.id)

    // Get projects for user's companies
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .in('company_id', companyIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    return NextResponse.json({ projects: projects || [] }, { status: 200 })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const body = await request.json()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get or create company
    let companyId = body.company_id
    if (!companyId) {
      // Create a default company for the user
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: body.company_name || `${profile.full_name || profile.email}'s Company`,
          owner_id: profile.id,
        })
        .select()
        .single()

      if (companyError || !company) {
        return NextResponse.json(
          { error: 'Failed to create company' },
          { status: 500 }
        )
      }

      companyId = company.id
    }

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        company_id: companyId,
        name: body.name,
        description: body.description,
        stage: body.stage || 'ideation',
        methodology: body.methodology || 'agile',
        lifecycle_stage: body.lifecycle_stage || 'early',
        created_by: profile.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

