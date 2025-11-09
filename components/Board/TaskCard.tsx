'use client'

import { motion } from 'framer-motion'
import { Calendar, User, Flag, MessageSquare, Clock } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { Task } from '@/types/board'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  onUpdate: (updates: Partial<Task>) => void
  onClick?: () => void
  light?: boolean
}

const priorityColors = {
  low: {
    light: 'bg-primary-100 text-primary-700 border-primary-300',
    dark: 'bg-primary-500/20 text-primary-400 border-primary-500/30'
  },
  medium: {
    light: 'bg-warning-100 text-warning-700 border-warning-300',
    dark: 'bg-warning-500/20 text-warning-400 border-warning-500/30'
  },
  high: {
    light: 'bg-orange-100 text-orange-700 border-orange-300',
    dark: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  urgent: {
    light: 'bg-danger-100 text-danger-700 border-danger-300',
    dark: 'bg-danger-500/20 text-danger-400 border-danger-500/30'
  },
}

const taskTypeColors = {
  task: {
    light: 'bg-primary-100 text-primary-700',
    dark: 'bg-primary-500/20 text-primary-400'
  },
  bug: {
    light: 'bg-danger-100 text-danger-700',
    dark: 'bg-danger-500/20 text-danger-400'
  },
  feature: {
    light: 'bg-success-100 text-success-700',
    dark: 'bg-success-500/20 text-success-400'
  },
  epic: {
    light: 'bg-purple-100 text-purple-700',
    dark: 'bg-purple-500/20 text-purple-400'
  },
  story: {
    light: 'bg-primary-100 text-primary-700',
    dark: 'bg-primary-500/20 text-primary-400'
  },
  subtask: {
    light: 'bg-gray-200 text-gray-700',
    dark: 'bg-gray-500/20 text-gray-400'
  },
  improvement: {
    light: 'bg-yellow-100 text-yellow-700',
    dark: 'bg-yellow-500/20 text-yellow-400'
  },
}

export default function TaskCard({ task, onUpdate, onClick, light = false }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  })

  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`p-4 rounded-lg border transition-all ${
        isDragging 
          ? (light ? 'opacity-50 border-primary-500/50 cursor-grabbing bg-white' : 'opacity-50 border-primary-500/50 cursor-grabbing bg-gray-800/50') 
          : (light ? 'border-gray-200 hover:border-primary-500/50 cursor-grab bg-white' : 'border-gray-700/50 hover:border-primary-500/50 cursor-grab bg-gray-800/50')
      }`}
      onClick={(e) => {
        // Prevent click when dragging
        if (isDragging) {
          e.stopPropagation()
          return
        }
        // Call the onClick handler if provided
        if (onClick) {
          onClick()
        }
      }}
    >
      {/* Task Type Badge */}
      {task.task_type && (
        <div className="mb-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            light 
              ? (taskTypeColors[task.task_type as keyof typeof taskTypeColors]?.light || taskTypeColors.task.light)
              : (taskTypeColors[task.task_type as keyof typeof taskTypeColors]?.dark || taskTypeColors.task.dark)
          }`}>
            {task.task_type}
          </span>
        </div>
      )}

      {/* Task Title */}
  <h4 className={`font-semibold mb-2 line-clamp-2 ${light ? 'text-black' : 'text-white'}`}>{task.title}</h4>

      {/* Task Description */}
      {task.description && (
        <p className={`text-sm mb-3 line-clamp-2 ${light ? 'text-gray-600' : 'text-gray-400'}`}>{task.description}</p>
      )}

      {/* Task Meta Information */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Priority */}
        {task.priority && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${
            light 
              ? (priorityColors[task.priority as keyof typeof priorityColors]?.light || priorityColors.medium.light)
              : (priorityColors[task.priority as keyof typeof priorityColors]?.dark || priorityColors.medium.dark)
          }`}>
            <Flag className="w-3 h-3" />
            <span className="capitalize">{task.priority}</span>
          </div>
        )}

        {/* Story Points */}
        {task.story_points && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${light ? 'bg-gray-100 text-gray-700' : 'bg-gray-700/50 text-gray-300'}`}>
            <span>{task.story_points} SP</span>
          </div>
        )}

        {/* Time Spent */}
        {task.time_spent && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${light ? 'bg-gray-100 text-gray-700' : 'bg-gray-700/50 text-gray-300'}`}>
            <Clock className="w-3 h-3" />
            <span>{Math.round(task.time_spent / 60)}h</span>
          </div>
        )}
      </div>

      {/* Task Footer */}
      <div className={`flex items-center justify-between mt-3 pt-3 border-t ${light ? 'border-gray-200' : 'border-gray-700/50'}`}>
        <div className={`flex items-center gap-3 text-xs ${light ? 'text-gray-600' : 'text-gray-400'}`}>
          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}

          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{task.assignee.full_name || task.assignee.email}</span>
            </div>
          )}
        </div>

        {/* Comments Count */}
        {task.comments_count !== undefined && task.comments_count > 0 && (
          <div className={`flex items-center gap-1 text-xs ${light ? 'text-gray-600' : 'text-gray-400'}`}>
            <MessageSquare className="w-3 h-3" />
            <span>{task.comments_count}</span>
          </div>
        )}
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.map((label, index) => (
            <span
              key={index}
              className={`px-2 py-0.5 rounded text-xs ${
                light ? 'bg-primary-100 text-primary-700' : 'bg-primary-500/20 text-primary-400'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

