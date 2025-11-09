import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Trash2, Download, FileText, FileVideo, FileImage, FileCode, Loader2 } from 'lucide-react'

const ALLOWED_FILE_TYPES = [
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf', // .pdf
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/csv', // .csv
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
]

interface DataSource {
  id: string
  project_id: string
  source_type: string
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  source_url: string | null
  processed: boolean
  processing_status: string
  uploaded_by: string
  created_at: string
}

interface DocFilesProps {
  projectId: string
}

export default function DocFiles({ projectId }: DocFilesProps): React.ReactElement {
  const [files, setFiles] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch existing files
  const fetchFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/data-sources?source_type=document`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.data_sources || [])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  // Load files on mount
  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Validate file type
  const validateFile = (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Allowed types: Word documents, PDFs, PowerPoint, CSV, and Excel files')
    }
    return true
  }

  // Handle file selection
  const handleFileSelect = (selectedFiles: FileList | null) => {
    setError(null)
    if (!selectedFiles || selectedFiles.length === 0) return
    
    try {
      const validFiles = Array.from(selectedFiles).filter(file => {
        try {
          validateFile(file)
          return true
        } catch (error) {
          setError((error as Error).message)
          return false
        }
      })
      
      if (validFiles.length > 0) {
        uploadFiles(validFiles)
      }
    } catch (error) {
      setError((error as Error).message)
    }
  }

  // Upload files
  const uploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true)

    for (const file of filesToUpload) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('project_id', projectId)
        formData.append('source_type', 'document')
        formData.append('file_name', file.name)
        formData.append('file_size', file.size.toString())
        formData.append('mime_type', file.type)

        // Upload file
        const res = await fetch(`/api/projects/${projectId}/data-sources/upload`, {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
          // Refresh file list
          await fetchFiles()
        } else {
          const errorText = await res.text()
          console.error('Upload failed:', errorText)
          let errorMessage = 'Failed to upload file'
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
            if (errorData.details) {
              errorMessage += ': ' + (typeof errorData.details === 'string' ? errorData.details : JSON.stringify(errorData.details))
            }
          } catch (e) {
            errorMessage += ': ' + errorText
          }
          setError(errorMessage)
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        setError('Error uploading file')
      } finally {
        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[file.name]
            return newProgress
          })
        }, 2000)
      }
    }

    setIsUploading(false)
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  // Delete file
  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const res = await fetch(`/api/projects/${projectId}/data-sources/${fileId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchFiles()
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      setError('Error deleting file')
    }
  }

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return FileText
    if (mimeType.startsWith('video/')) return FileVideo
    if (mimeType.startsWith('image/')) return FileImage
    if (mimeType.includes('code') || mimeType.includes('text')) return FileCode
    return FileText
  }

  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-6 sm:p-8 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".doc,.docx,.pdf,.ppt,.pptx,.csv,.xls,.xlsx"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-200 p-3 sm:p-4 mb-3 sm:mb-4">
            <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            Upload Documents & Files
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Drag and drop files here or click to browse
          </p>
          <p className="text-xs text-gray-500 mb-3 sm:mb-4">
            Allowed file types: Word documents (.doc, .docx), PDFs, PowerPoint (.ppt, .pptx), CSV, and Excel files (.xls, .xlsx)
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Select Files'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs sm:text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="text-xs sm:text-sm">
                <div className="flex justify-between text-gray-700 mb-1">
                  <span className="truncate">{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files List */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Uploaded Documents ({files.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            No documents uploaded yet
          </div>
        ) : (
          <div className="grid gap-3">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.mime_type)
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 sm:gap-4 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="rounded-lg bg-gray-100 p-2 sm:p-3">
                    <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {file.file_name || 'Untitled'}
                    </h4>
                    <div className="flex gap-2 sm:gap-3 mt-1 text-xs text-gray-500">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                      {file.processing_status !== 'completed' && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-600">{file.processing_status}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    {file.source_url && (
                      <button
                        onClick={() => window.open(file.source_url!, '_blank')}
                        className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                        title="Download"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 rounded-md hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}