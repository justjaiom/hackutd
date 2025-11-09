'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, User, Flag, Tag, Clock, Trash2, Save } from 'lucide-react'
import { Task } from '@/types/board'

interface TaskDetailModalProps {
  task: Task
  projectId: string
  onClose: () => void
  onUpdate: (updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
}

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-blue-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
]

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

const taskTypeOptions = [
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'epic', label: 'Epic' },
  { value: 'story', label: 'Story' },
  { value: 'subtask', label: 'Subtask' },
  { value: 'improvement', label: 'Improvement' },
]

export default function TaskDetailModal({ 
  task, 
  projectId, 
  onClose, 
  onUpdate, 
  onDelete 
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    task_type: (task.task_type as string) || 'task',
    story_points: task.story_points?.toString() || '',
    due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    labels: task.labels?.join(', ') || '',
  })

  const handleSave = () => {
    const updates = {
      title: formData.title,
      description: formData.description || null,
      status: formData.status as Task['status'],
      priority: formData.priority as Task['priority'],
      task_type: formData.task_type as Task['task_type'],
      story_points: formData.story_points ? parseInt(formData.story_points) : null,
      due_date: formData.due_date || null,
      labels: formData.labels ? formData.labels.split(',').map(l => l.trim()) : [],
    }
    
    onUpdate(updates)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      onDelete(task.id)
      onClose()
    } catch (error) {
      console.error('Error deleting task:', error)
      setIsDeleting(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'No due date'
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Task' : 'Task Details'}
            </h2>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              task.task_type === 'bug' ? 'bg-red-100 text-red-700' :
              task.task_type === 'feature' ? 'bg-green-100 text-green-700' :
              task.task_type === 'epic' ? 'bg-purple-100 text-purple-700' :
              'bg-indigo-100 text-indigo-700'
            }`}>
              {task.task_type}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Edit
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter task title"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter task description"
              />
            ) : (
              <p className="text-gray-700">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-900 capitalize">{task.status?.replace('_', ' ')}</span>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              {isEditing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={priorityOptions.find(p => p.value === task.priority)?.color || 'text-gray-900'}>
                  {priorityOptions.find(p => p.value === task.priority)?.label || task.priority}
                </span>
              )}
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              {isEditing ? (
                <select
                  value={formData.task_type}
                  onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {taskTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-900 capitalize">{task.task_type}</span>
              )}
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Points
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={formData.story_points}
                  onChange={(e) => setFormData({ ...formData, story_points: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="0"
                />
              ) : (
                <span className="text-gray-900">{task.story_points || 0}</span>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              ) : (
                <span className="text-gray-900">{formatDate(task.due_date || null)}</span>
              )}
            </div>

            {/* Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labels
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.labels}
                  onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="frontend, backend, urgent"
                />
              ) : (
                <div className="flex flex-wrap gap-1">
                  {task.labels && task.labels.length > 0 ? (
                    task.labels.map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
                      >
                        {label}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No labels</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
            {task.updated_at && task.updated_at !== task.created_at && (
              <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </button>

          {isEditing && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    title: task.title || '',
                    description: task.description || '',
                    status: task.status || 'todo',
                    priority: task.priority || 'medium',
                    task_type: task.task_type || 'task',
                    story_points: task.story_points?.toString() || '',
                    due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
                    labels: task.labels?.join(', ') || '',
                  })
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}