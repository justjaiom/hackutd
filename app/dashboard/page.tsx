'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import Board from '@/components/Board/Board'
import { Project } from '@/types/board'

export default function DashboardPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
        if (data.projects && data.projects.length > 0) {
          setSelectedProject(data.projects[0])
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  if (isLoading || isLoadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Adjacent Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {selectedProject && (
              <select
                value={selectedProject.id}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value)
                  if (project) setSelectedProject(project)
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
            <a
              href="/api/auth/logout"
              className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Logout
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-80px)]">
        {selectedProject ? (
          <Board projectId={selectedProject.id} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-400 mb-2">
                No projects found
              </h2>
              <p className="text-gray-500">
                Create a project to get started
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

