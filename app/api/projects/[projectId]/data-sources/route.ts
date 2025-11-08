import { getSession } from '@auth0/nextjs-auth0'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { projectId } = params
    const body = await request.json()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth0_id', session.user.sub)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

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
      uploaded_by: profile.id,
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
