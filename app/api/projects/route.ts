import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// We use Supabase auth. Ensure a user profile exists; create one on first access.
async function getOrCreateProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) return existing

  // If not found, insert a new profile based on auth user
  const payload: any = {
    id: user.id,
    // profiles.email is NOT NULL; fallback if provider hides email
    email: user.email || `${user.id}@no-email.local`,
    full_name: (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || '',
    avatar_url: (user.user_metadata as any)?.avatar_url || (user.user_metadata as any)?.picture || null,
  }

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()

  if (insertError) {
    console.error('Failed to create profile:', insertError)
    return null
  }

  return created
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    // We assume dashboard access already requires auth; proceed without explicit profile check.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ projects: [] }, { status: 200 })
    }

    // Attempt to get companies by user id (owner_id matches profiles.id which == auth user id after migration)
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user.id)

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
    const supabase = await createClient()
    const body = await request.json().catch(() => ({}))
    // Support bearer token if cookies not yet propagated
    const authHeader = request.headers.get('Authorization')
    let user: any
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data.user) user = data.user
    }
    if (!user && body.accessToken) {
      const { data, error } = await supabase.auth.getUser(body.accessToken)
      if (!error && data.user) user = data.user
    }
    if (!user) {
      const { data } = await supabase.auth.getUser()
      if (data.user) user = data.user
    }
    if (!user) {
      console.warn('POST /api/projects unauthorized: no user. authHeader?', !!authHeader, 'bodyToken?', !!body.accessToken)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure a profile exists (company may depend on FK constraints)
    await getOrCreateProfile()

    // Get or create company (owner_id references profiles.id which should match auth user id)
    let companyId = body.company_id
    if (!companyId) {
      const defaultCompanyName = body.company_name || `${(user?.user_metadata as any)?.full_name || user?.email || 'My'} Company`
      // Verify profile row exists for this user id before inserting company
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id)
        .maybeSingle()
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: defaultCompanyName,
          owner_id: user?.id,
          settings: { website: null },
          description: null,
        })
        .select()
        .single()

      if (companyError || !company) {
        console.error('Company insert error', companyError, 'body:', body, 'userId:', user?.id, 'profileExists:', !!profileRow)
        return NextResponse.json(
          { error: 'Failed to create company', details: companyError?.message, profileExists: !!profileRow },
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
        created_by: user?.id,
        metadata: { context: null },
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
    console.info('Created project', project?.id, 'company', companyId)
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

