'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Search, MoreVertical } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import BoardColumn from './BoardColumn'
import TaskCard from './TaskCard'
import CreateTaskModal from './CreateTaskModal'
import TaskDetailModal from './TaskDetailModal'
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
  light?: boolean
}

export default function Board({ projectId, tasks: initialTasks = [], light = false }: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRunningLead, setIsRunningLead] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  )

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

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
        setSelectedTask(null)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((task) => task.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveTask(null)
    
    if (!over) return
    
    const taskId = active.id as string
    const newStatus = over.id as string
    
    // Find the task being moved
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return
    
    // Optimistically update the UI
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
      )
    )
    
    // Update the task on the server
    try {
      await handleTaskUpdate(taskId, { status: newStatus as Task['status'] })
    } catch (error) {
      // Revert the optimistic update if the server update fails
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: task.status } : t
        )
      )
      console.error('Error updating task status:', error)
    }
  }

  return (
    <div className={`flex flex-col h-full ${light ? 'bg-white text-black' : 'bg-[#0a0a0a] text-white'}`}>
      {/* Board Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 border-b flex-shrink-0 gap-3 sm:gap-0 ${light ? 'border-gray-200' : 'border-gray-800'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <h1 className={`${light ? 'text-lg sm:text-2xl font-bold text-black' : 'text-lg sm:text-2xl font-bold gradient-text'}`}>Project Board</h1>
          <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border w-full sm:w-auto ${light ? 'bg-gray-50 border-gray-200' : 'bg-gray-900/50 border-gray-800'}`}>
            <Search className={`w-3 h-3 sm:w-4 sm:h-4 ${light ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${light ? 'bg-transparent border-none outline-none text-xs sm:text-sm text-black placeholder-gray-500 w-full' : 'bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-gray-500 w-full'}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm flex-shrink-0 ${light ? 'bg-white border-gray-300 text-black' : 'bg-gray-900/50 border-gray-800 text-white'}`}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={`${light ? 'flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-500 rounded-lg font-semibold text-xs sm:text-sm text-white hover:scale-105 transition-transform whitespace-nowrap flex-shrink-0' : 'flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-semibold text-xs sm:text-sm hover:scale-105 transition-transform whitespace-nowrap flex-shrink-0'}`}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Create Task</span>
            <span className="sm:hidden">Create</span>
          </button>
          <button
            onClick={async () => {
              if (isRunningLead) return
              setIsRunningLead(true)
              try {
                const response = await fetch('/api/agents/nemotron/run-pipeline', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ projectId }),
                })
                if (response.ok) {
                  const data = await response.json()
                  // Refresh tasks
                  await fetchTasks()
                  const tCount = (data.tasks && data.tasks.length) || 0
                  alert(`Lead Agent run complete — created ${tCount} tasks.`)
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
            className={`${light ? 'flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-500 rounded-lg font-semibold text-xs sm:text-sm text-white hover:scale-105 transition-transform whitespace-nowrap flex-shrink-0' : 'flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold text-xs sm:text-sm hover:scale-105 transition-transform whitespace-nowrap flex-shrink-0'}`}
          >
            <span className="hidden sm:inline">{isRunningLead ? 'Running Lead Agent...' : 'Run Lead Agent'}</span>
            <span className="sm:hidden">{isRunningLead ? 'Running...' : 'Lead Agent'}</span>
          </button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 sm:p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 sm:gap-4 h-full min-w-fit">
            {COLUMNS.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={getTasksForColumn(column.status)}
                onTaskUpdate={handleTaskUpdate}
                onTaskCreate={handleTaskCreate}
                onTaskClick={setSelectedTask}
                light={light}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 opacity-90">
                <TaskCard
                  task={activeTask}
                  onUpdate={() => {}} // No-op for overlay
                  onClick={() => {}} // No-op for overlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleTaskCreate}
          light={light}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => {
            handleTaskUpdate(selectedTask.id, updates)
            setSelectedTask({ ...selectedTask, ...updates })
          }}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  )
}

