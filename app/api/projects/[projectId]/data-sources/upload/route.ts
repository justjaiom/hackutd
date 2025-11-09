import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  console.log('Starting upload request for project:', params.projectId)
  
  let supabase
  try {
    supabase = await createClient()
    console.log('Supabase client created successfully')
  } catch (clientError) {
    console.error('Error creating Supabase client:', clientError)
    return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
  }

  try {
    console.log('Authenticating user...')
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    console.log('Auth response:', { 
      user: user ? 'User found' : 'No user', 
      error: authError ? authError.message : 'No error' 
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params
    
    // Check content type to determine if it's a file upload or repository URL
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
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

      // Create database record for file
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
        uploaded_by: user.id.toString(),  // Convert UUID to string
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
    } else {
      // Handle repository URL submission
      console.log('Handling repository URL submission...')
      let parsedBody;
      try {
        const body = await request.json()
        console.log('Received request body:', JSON.stringify(body, null, 2))
        parsedBody = body
      } catch (parseError) {
        console.error('Error parsing request body:', parseError)
        return NextResponse.json({ 
          error: 'Invalid request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        }, { status: 400 })
      }

      const { source_type, source_url } = parsedBody
      console.log('Extracted data:', { source_type, source_url })

      if (!source_url) {
        return NextResponse.json({ error: 'No repository URL provided' }, { status: 400 })
      }

      console.log('Creating repository record with project_id:', projectId) // Log project ID
      // Create database record for repository
      // Ensure we use an allowed source type
      const validSourceTypes = ['meeting', 'document', 'video', 'transcript', 'file', 'note'];
      const defaultSourceType = 'file';
      const requestedSourceType = source_type || defaultSourceType;
      const finalSourceType = validSourceTypes.includes(requestedSourceType) ? requestedSourceType : defaultSourceType;

      const payload = {
        project_id: projectId,
        source_type: finalSourceType,
        source_url,
        processed: false,
        processing_status: 'completed',
        extracted_data: {},
        metadata: {},
        uploaded_by: user.id.toString(),  // Convert UUID to string
      }
      console.log('Payload:', payload) // Log payload being sent to Supabase

      console.log('Attempting to insert into project_data_sources:', JSON.stringify(payload, null, 2))
      
      try {
        let result = await supabase
          .from('project_data_sources')
          .insert(payload)
          .select()
          .single()

        if (result.error) {
          console.error('Supabase error creating repository record:', {
            error: result.error,
            code: result.error.code,
            message: result.error.message,
            details: result.error.details,
            hint: result.error.hint
          })
          return NextResponse.json({ 
            error: 'Failed to create repository record', 
            details: {
              message: result.error.message,
              code: result.error.code,
              hint: result.error.hint
            }
          }, { status: 500 })
        }

        if (!result.data) {
          console.error('No data returned from Supabase')
          return NextResponse.json({ 
            error: 'No data returned from database', 
          }, { status: 500 })
        }

        console.log('Successfully created repository record:', result.data)
        return NextResponse.json({ data_source: result.data }, { status: 201 })
      } catch (dbError) {
        console.error('Unexpected error during database operation:', dbError)
        return NextResponse.json({ 
          error: 'Database operation failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
