import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileName = `${projectId}/${Date.now()}-${file.name}`
    const fileBuffer = await file.arrayBuffer()
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file', details: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-files')
      .getPublicUrl(fileName)

    // Create database record
    const payload = {
      project_id: projectId,
      source_type: formData.get('source_type') || 'document',
      source_url: urlData.publicUrl,
      storage_path: fileName,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      processed: false,
      processing_status: 'completed',
      extracted_data: {},
      metadata: {},
      uploaded_by: user.id,
    }

    const { data: dataSource, error: dbError } = await supabase
      .from('project_data_sources')
      .insert(payload)
      .select()
      .single()

    if (dbError) {
      console.error('Error creating data source record:', dbError)
      // Try to delete the uploaded file
      await supabase.storage.from('project-files').remove([fileName])
      return NextResponse.json({ error: 'Failed to create data source record', details: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ data_source: dataSource }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
