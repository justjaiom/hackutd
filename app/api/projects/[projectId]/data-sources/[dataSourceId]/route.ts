import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; dataSourceId: string } }
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

    const { dataSourceId } = params

    // Get the data source to find the storage path
    const { data: dataSource, error: fetchError } = await supabase
      .from('project_data_sources')
      .select('*')
      .eq('id', dataSourceId)
      .single()

    if (fetchError || !dataSource) {
      console.error('Error fetching data source:', fetchError)
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 })
    }

    // Delete from storage if storage_path exists
    if (dataSource.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([dataSource.storage_path])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('project_data_sources')
      .delete()
      .eq('id', dataSourceId)

    if (deleteError) {
      console.error('Error deleting data source:', deleteError)
      return NextResponse.json({ error: 'Failed to delete data source' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
