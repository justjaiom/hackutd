import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Trash2, Download, FileVideo, Loader2 } from 'lucide-react'

const ALLOWED_FILE_TYPES = [
  'audio/mpeg', // .mp3
  'video/mp4', // .mp4
]

interface Recording {
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

interface RecordingsProps {
  projectId: string
}

export default function Recordings({ projectId }: RecordingsProps): React.ReactElement {
  const [files, setFiles] = useState<Recording[]>([])
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
      const res = await fetch(`/api/projects/${projectId}/data-sources?type=recording`)
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
      throw new Error('Invalid file type. Allowed types: MP3 and MP4 files')
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
        formData.append('source_type', 'recording')
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
          console.error('Upload failed:', await res.text())
          setError('Failed to upload file')
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
    if (!confirm('Are you sure you want to delete this recording?')) return

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

  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  // Get file duration (for future enhancement)
  const getFileDuration = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        const media = file.type.startsWith('audio/') ? new Audio() : document.createElement('video')
        media.src = URL.createObjectURL(file)
        media.onloadedmetadata = () => {
          URL.revokeObjectURL(media.src)
          const minutes = Math.floor(media.duration / 60)
          const seconds = Math.floor(media.duration % 60)
          resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }
        media.onerror = () => resolve('--:--')
      } else {
        resolve('--:--')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-gray-700 bg-gray-900/40 hover:border-gray-600'
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
          accept=".mp3,.mp4"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-800 p-4 mb-4">
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            Upload Meeting Recordings
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Drag and drop files here or click to browse
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Allowed file types: MP3 and MP4 files
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Select Files'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-md">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="text-sm">
                <div className="flex justify-between text-gray-400 mb-1">
                  <span className="truncate">{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
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
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Meeting Recordings ({files.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No recordings uploaded yet
          </div>
        ) : (
          <div className="grid gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/40 p-4 hover:border-gray-700 transition-colors"
              >
                <div className="rounded-lg bg-gray-800 p-3">
                  <FileVideo className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-200 truncate">
                    {file.file_name || 'Untitled'}
                  </h4>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {file.source_url && (
                    <button
                      onClick={() => window.open(file.source_url!, '_blank')}
                      className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}