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

  // Refetch projects when the page becomes visible (e.g., after navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        console.log('Dashboard visibility changed - refetching projects')
        fetchProjects()
      }
    }

    const handleFocus = () => {
      if (user) {
        console.log('Dashboard window focused - refetching projects')
        fetchProjects()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true)
      const response = await fetch('/api/projects', { 
        credentials: 'include',
        cache: 'no-store' // Ensure we always get fresh data
      })
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
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-3 max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-black">
              Adjacent Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">Welcome back, {user.user_metadata?.full_name || user.email}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors duration-200"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" /> Create Project
            </button>
            <button
              onClick={() => { if (confirm('Sign out?')) signOut() }}
              disabled={isSigningOut}
              className="rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {projects.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 sm:p-12 text-center mt-8">
            <div className="mb-6 p-6 rounded-full bg-gray-100">
              <Plus className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              No projects yet
            </h2>
            <p className="mt-3 max-w-md text-sm sm:text-base text-gray-600">
              Create your first project to start organizing company context, knowledge, meetings, and the work board.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-8 flex items-center gap-2 rounded-xl px-6 py-3 text-sm sm:text-base font-semibold bg-black text-white hover:bg-gray-800 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Create Your First Project
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-black">
                  Your Projects
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-black text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" /> New
              </button>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {projects.map((p, index) => (
                <li key={p.id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                  <button
                    onClick={() => router.push(`/projects/${p.id}`)}
                    className="group relative flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 sm:p-5 text-left hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{p.name}</div>
                      {p.description && (
                        <div className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-gray-600">{p.description}</div>
                      )}
                    </div>
                    <div className="ml-3 p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 transition-transform group-hover:translate-x-1" />
                    </div>
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

