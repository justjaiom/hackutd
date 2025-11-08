'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'
import { Task, BoardColumn as BoardColumnType } from '@/types/board'

interface BoardColumnProps {
  column: BoardColumnType
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskCreate: (taskData: Partial<Task>) => void
}

export default function BoardColumn({ column, tasks, onTaskUpdate }: BoardColumnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col w-80 bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${column.color}`} />
          <h3 className="font-semibold text-white">{column.title}</h3>
          <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-400">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={(updates) => onTaskUpdate(task.id, updates)}
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

