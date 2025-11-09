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
      router.replace('/signin')
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold dashboard-gradient-text">Adjacent Dashboard</h1>
            <p className="mt-1 text-sm text-gray-700">Welcome back, {user.user_metadata?.full_name || user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-blue-500 text-white border-2 border-transparent hover:bg-transparent hover:text-blue-500 hover:border-blue-500 transition-all duration-200"
            >
              <Plus className="h-4 w-4" /> Create Project
            </button>
            <button
              onClick={() => { if (confirm('Sign out?')) signOut() }}
              disabled={isSigningOut}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl p-6">
        {projects.length === 0 ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No projects yet</h2>
            <p className="mt-2 max-w-md text-sm text-gray-600">Create your first project to start organizing company context, knowledge, meetings, and the work board.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-blue-500 text-white border-2 border-transparent hover:bg-transparent hover:text-blue-500 hover:border-blue-500 transition-all duration-200"
            >
              <Plus className="h-4 w-4" /> Create Project
            </button>
          </div>
        ) : (
          <div>
              <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-blue-500 text-blue-500 px-3 py-2 text-sm hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" /> New
              </button>
            </div>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => router.push(`/projects/${p.id}`)}
                    className="group flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white/60 p-4 text-left hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-black">{p.name}</div>
                      {p.description && (
                        <div className="mt-1 line-clamp-2 text-sm text-gray-600">{p.description}</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-600 transition group-hover:translate-x-1" />
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

