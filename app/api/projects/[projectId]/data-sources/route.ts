import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List all data sources for a project
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
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

    const { projectId } = params

    const { data: dataSources, error } = await supabase
      .from('project_data_sources')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching data sources:', error)
      return NextResponse.json({ error: 'Failed to fetch data sources' }, { status: 500 })
    }

    return NextResponse.json({ data_sources: dataSources })
  } catch (error) {
    console.error('Get data sources error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new data source
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
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

    const { projectId } = params
    const body = await request.json()

    const payload: any = {
      project_id: projectId,
      source_type: body.source_type || 'document',
      source_url: body.source_url || null,
      file_name: body.file_name || null,
      file_size: body.file_size || null,
      mime_type: body.mime_type || null,
      processed: body.processed ?? false,
      processing_status: body.processing_status || 'pending',
      extracted_data: body.extracted_data || {},
      metadata: body.metadata || {},
      uploaded_by: user.id,
    }

    const { data: dataSource, error } = await supabase
      .from('project_data_sources')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Error creating data source:', error)
      return NextResponse.json({ error: 'Failed to create data source' }, { status: 500 })
    }

    return NextResponse.json({ data_source: dataSource }, { status: 201 })
  } catch (error) {
    console.error('Create data source error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
