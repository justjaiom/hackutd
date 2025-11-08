'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Search, MoreVertical } from 'lucide-react'
import BoardColumn from './BoardColumn'
import TaskCard from './TaskCard'
import CreateTaskModal from './CreateTaskModal'
import { Task, BoardColumn as BoardColumnType } from '@/types/board'

const COLUMNS: BoardColumnType[] = [
  { id: 'todo', title: 'To Do', status: 'todo', color: 'bg-gray-500' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress', color: 'bg-blue-500' },
  { id: 'review', title: 'Review', status: 'review', color: 'bg-yellow-500' },
  { id: 'done', title: 'Done', status: 'done', color: 'bg-green-500' },
]

interface BoardProps {
  projectId: string
  tasks?: Task[]
}

export default function Board({ projectId, tasks: initialTasks = [] }: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRunningLead, setIsRunningLead] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  useEffect(() => {
    // Fetch tasks from API
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? updatedTask.task : task))
        )
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskCreate = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (response.ok) {
        const newTask = await response.json()
        setTasks((prevTasks) => [...prevTasks, newTask.task])
        setIsCreateModalOpen(false)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
    return matchesSearch && matchesPriority
  })

  const getTasksForColumn = (status: string) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      {/* Board Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold gradient-text">Project Board</h1>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-800">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-800 text-sm text-white"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-semibold text-sm hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
          <button
            onClick={async () => {
              if (isRunningLead) return
              setIsRunningLead(true)
              try {
                const response = await fetch('/api/agents/lead/run', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ projectId }),
                })
                if (response.ok) {
                  const data = await response.json()
                  // Refresh tasks
                  await fetchTasks()
                  const tCount = (data.tasks && data.tasks.length) || 0
                  const zCount = (data.tensions && data.tensions.length) || 0
                  alert(`Lead Agent run complete — created ${tCount} tasks and ${zCount} tensions.`)
                } else {
                  const err = await response.json()
                  alert('Lead Agent failed: ' + (err.error || response.statusText))
                }
              } catch (error) {
                console.error('Error running lead agent:', error)
                alert('Error running Lead Agent')
              }
              setIsRunningLead(false)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold text-sm hover:scale-105 transition-transform"
          >
            {isRunningLead ? 'Running Lead Agent...' : 'Run Lead Agent'}
          </button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-fit">
          {COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={getTasksForColumn(column.status)}
              onTaskUpdate={handleTaskUpdate}
              onTaskCreate={handleTaskCreate}
            />
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleTaskCreate}
        />
      )}
    </div>
  )
}

