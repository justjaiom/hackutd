import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Trash2, Download, Link2, GitBranch, Loader2 } from 'lucide-react'

interface Repository {
  id: string
  project_id: string
  source_type: string
  source_url: string
  created_at: string
}

interface RepoProps {
  projectId: string
}

const VALID_REPO_PATTERNS = [
  /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/,  // GitHub
  /^https?:\/\/gitlab\.com\/[\w-]+\/[\w.-]+\/?$/,  // GitLab
  /^https?:\/\/bitbucket\.org\/[\w-]+\/[\w.-]+\/?$/,  // Bitbucket
  /^https?:\/\/[a-z0-9]+\.console\.aws\.amazon\.com\/codecommit\/home#\/repository\/[\w.-]+$/  // AWS CodeCommit
]

export default function Repositories({ projectId }: RepoProps): React.ReactElement {
  const [repos, setRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch existing repos
  const fetchRepos = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/data-sources?type=repository`)
      if (res.ok) {
        const data = await res.json()
        setRepos(data.data_sources || [])
      }
    } catch (error) {
      console.error('Error fetching repositories:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  // Load repos on mount
  useEffect(() => {
    fetchRepos()
  }, [fetchRepos])

  // Validate repository URL
  const validateRepoUrl = (url: string) => {
    return VALID_REPO_PATTERNS.some(pattern => pattern.test(url))
  }

  // Add repository
  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateRepoUrl(repoUrl)) {
      setError('Invalid repository URL. Please enter a valid GitHub, GitLab, Bitbucket, or AWS CodeCommit repository URL.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/projects/${projectId}/data-sources/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_type: 'repository',
          source_url: repoUrl,
        }),
      })

      if (res.ok) {
        setRepoUrl('')
        await fetchRepos()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to add repository')
      }
    } catch (error) {
      console.error('Error adding repository:', error)
      setError('Failed to add repository')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete repository
  const handleDelete = async (repoId: string) => {
    if (!confirm('Are you sure you want to delete this repository?')) return

    try {
      const res = await fetch(`/api/projects/${projectId}/data-sources/${repoId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchRepos()
      }
    } catch (error) {
      console.error('Error deleting repository:', error)
      setError('Failed to delete repository')
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Repository Form */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-6">
        <form onSubmit={handleAddRepo} className="space-y-4">
          <div>
            <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-300 mb-2">
              Repository URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !repoUrl}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Repository'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Supports GitHub, GitLab, Bitbucket, and AWS CodeCommit repositories
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-md">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Repositories List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Connected Repositories ({repos.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : repos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No repositories connected yet
          </div>
        ) : (
          <div className="grid gap-3">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/40 p-4 hover:border-gray-700 transition-colors"
              >
                <div className="rounded-lg bg-gray-800 p-3">
                  <GitBranch className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <a
                    href={repo.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-200 hover:text-indigo-400 truncate block"
                  >
                    {repo.source_url}
                  </a>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>{new Date(repo.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(repo.source_url, '_blank')}
                    className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
                    title="Open Repository"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(repo.id)}
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