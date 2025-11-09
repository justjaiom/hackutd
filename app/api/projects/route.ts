import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserCompanies } from '@/lib/db/companies'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's companies
    const companies = await getUserCompanies(user.id)
    const companyIds = companies.map((c) => c.id)

    if (companyIds.length === 0) {
      return NextResponse.json({ projects: [] })
    }

    // Get projects for user's companies
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .in('company_id', companyIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects: data || [] })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    // Ensure user profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        })
        .select()
        .single()

      if (profileError || !newProfile) {
        console.error('Error creating profile:', profileError)
        return NextResponse.json(
          { 
            error: 'Failed to create user profile',
            details: profileError?.message || 'Unknown error'
          },
          { status: 500 }
        )
      }
    }

    // Get or create a company for the user
    let companies = await getUserCompanies(user.id)
    let companyId: string

    if (companies.length === 0) {
      // Create a default company for the user using the same authenticated client
      const companyName = `${user.user_metadata?.full_name || user.email || 'User'}'s Company`
      
      const { data: defaultCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          owner_id: user.id,
          description: 'Default company',
        })
        .select()
        .single()

      if (companyError || !defaultCompany) {
        console.error('Error creating default company:', companyError)
        
        // Check if the error is about missing table
        if (companyError?.message?.includes("Could not find the table") || 
            companyError?.message?.includes("relation") && companyError?.message?.includes("does not exist")) {
          return NextResponse.json(
            { 
              error: 'Database migrations not run',
              details: 'The companies table does not exist. Please run the database migrations first.',
              help: 'See MIGRATION_GUIDE.md for instructions. Go to Supabase Dashboard → SQL Editor and run the migration files in order: 001_initial_schema.sql, 002_auth0_and_project_stages.sql, etc.'
            },
            { status: 500 }
          )
        }
        
        return NextResponse.json(
          { 
            error: 'Failed to create default company',
            details: companyError?.message || 'Unknown error'
          },
          { status: 500 }
        )
      }

      companyId = defaultCompany.id
    } else {
      // Use the first company
      companyId = companies[0].id
    }

    // Insert project with correct fields
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          company_id: companyId,
          name: name.trim(),
          description: description?.trim() || null,
          created_by: user.id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ project: data })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
