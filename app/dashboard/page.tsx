'use client'

import { useEffect, useRef, useState } from 'react'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { useRouter } from 'next/navigation'
import { Project } from '@/types/board'
import CreateProjectModal from '@/components/CreateProjectModal'
import { Plus, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading, signOut, isSigningOut } = useSupabaseAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const hasFetchedProjectsRef = useRef(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && !hasFetchedProjectsRef.current) {
      hasFetchedProjectsRef.current = true
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const handleProjectCreated = (project: Project) => {
    // Optimistically add and navigate to the project page
    setProjects((prev) => [project, ...prev])
    router.push(`/projects/${project.id}`)
  }

  if (isLoading || isLoadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Adjacent Dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">Welcome back, {user.user_metadata?.full_name || user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold hover:scale-105 transition"
            >
              <Plus className="h-4 w-4" /> Create Project
            </button>
            <button
              onClick={() => { if (confirm('Sign out?')) signOut() }}
              disabled={isSigningOut}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl p-6">
        {projects.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/30 p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-300">No projects yet</h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">Create your first project to start organizing company context, knowledge, meetings, and the work board.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold hover:scale-105 transition"
            >
              <Plus className="h-4 w-4" /> Create Project
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">Your Projects</h2>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" /> New
              </button>
            </div>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => router.push(`/projects/${p.id}`)}
                    className="group flex w-full items-center justify-between rounded-lg border border-gray-800 bg-gray-900/40 p-4 text-left hover:border-gray-700 hover:bg-gray-900"
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      {p.description && (
                        <div className="mt-1 line-clamp-2 text-sm text-gray-500">{p.description}</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 transition group-hover:translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  )
}

