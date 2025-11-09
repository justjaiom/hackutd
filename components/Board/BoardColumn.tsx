'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import { Task, BoardColumn as BoardColumnType } from '@/types/board'

interface BoardColumnProps {
  column: BoardColumnType
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskCreate: (taskData: Partial<Task>) => void
  onTaskClick: (task: Task) => void
  light?: boolean
}

export default function BoardColumn({ column, tasks, onTaskUpdate, onTaskClick, light = false }: BoardColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.status,
  })

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col w-80 rounded-xl border backdrop-blur-sm transition-all ${
          isOver 
            ? (light ? 'border-primary-600/40 bg-primary-600/8' : 'border-primary-600/70 bg-primary-600/10') 
            : (light ? 'border-gray-200 bg-white/0' : 'bg-gray-900/30 border-gray-800/50')
        }`}
    >
      {/* Column Header */}
        <div className={`flex items-center justify-between p-4 border-b ${light ? 'border-gray-200' : 'border-gray-800/50'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            <h3 className={`${light ? 'font-semibold text-black' : 'font-semibold text-white'}`}>{column.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${light ? 'bg-gray-100 text-gray-700' : 'bg-gray-800 text-gray-400'}`}>
              {tasks.length}
            </span>
          </div>
        </div>

      {/* Tasks List */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${light ? '' : ''}`}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={(updates) => onTaskUpdate(task.id, updates)}
            onClick={() => onTaskClick(task)}
            light={light}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No tasks in this column
          </div>
        )}
      </div>
    </motion.div>
  )
}

