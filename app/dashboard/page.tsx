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
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/20 bg-white/40 backdrop-blur-md shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Adjacent Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-700">Welcome back, {user.user_metadata?.full_name || user.email}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" /> Create Project
            </button>
            <button
              onClick={() => { if (confirm('Sign out?')) signOut() }}
              disabled={isSigningOut}
              className="rounded-lg border border-gray-300 bg-white/60 backdrop-blur-sm px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-white/80 disabled:opacity-50 transition-all"
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative mx-auto max-w-5xl p-4 sm:p-6">
        {projects.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-300 bg-white/60 backdrop-blur-md p-8 sm:p-12 text-center shadow-xl">
            <div className="mb-6 p-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
              <Plus className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              No projects yet
            </h2>
            <p className="mt-3 max-w-md text-sm sm:text-base text-gray-700">
              Create your first project to start organizing company context, knowledge, meetings, and the work board.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-8 flex items-center gap-2 rounded-xl px-6 py-3 text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Create Your First Project
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Your Projects
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" /> New
              </button>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {projects.map((p, index) => (
                <li key={p.id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                  <button
                    onClick={() => router.push(`/projects/${p.id}`)}
                    className="group relative flex w-full items-center justify-between rounded-xl border-2 border-white/50 bg-white/70 backdrop-blur-md p-4 sm:p-5 text-left hover:border-purple-300 hover:bg-white/90 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    {/* Gradient accent on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="min-w-0 flex-1 relative z-10">
                      <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{p.name}</div>
                      {p.description && (
                        <div className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-gray-600">{p.description}</div>
                      )}
                    </div>
                    <div className="relative z-10 ml-3 p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 transition-transform group-hover:translate-x-1" />
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

