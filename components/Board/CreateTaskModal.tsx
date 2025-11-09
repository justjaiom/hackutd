'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Task } from '@/types/board'

interface CreateTaskModalProps {
  projectId: string
  onClose: any
  onCreate: (taskData: Partial<Task>) => void
  light?: boolean
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function CreateTaskModal({ projectId, onClose, onCreate, light = false }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    task_type: 'task' as Task['task_type'],
    story_points: '',
    due_date: '',
    labels: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      project_id: projectId,
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      task_type: formData.task_type,
      story_points: formData.story_points ? parseInt(formData.story_points) : null,
      due_date: formData.due_date || null,
      labels: formData.labels ? formData.labels.split(',').map(l => l.trim()) : [],
    })
  }

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${light ? 'bg-black/30' : 'bg-black/50'} backdrop-blur-sm`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-2xl rounded-xl border shadow-2xl ${light ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'}`}
        >
          <div className={`flex items-center justify-between p-6 border-b ${light ? 'border-gray-200' : 'border-gray-800'}`}>
            <h2 className={`text-xl font-bold ${light ? 'text-black' : 'text-white'}`}>Create New Task</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${light ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
            >
              <X className={`w-5 h-5 ${light ? 'text-gray-600' : 'text-gray-400'}`} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${light ? 'bg-white border-gray-300 text-black' : 'bg-gray-800 border-gray-700 text-white'}`}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${light ? 'bg-white border-gray-300 text-black' : 'bg-gray-800 border-gray-700 text-white'}`}
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${light ? 'bg-white border-gray-300 text-black' : 'bg-gray-800 border-gray-700 text-white'}`}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${light ? 'bg-white border-gray-300 text-black' : 'bg-gray-800 border-gray-700 text-white'}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Type
                </label>
                <select
                  value={formData.task_type}
                  onChange={(e) => setFormData({ ...formData, task_type: e.target.value as Task['task_type'] })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="story">Story</option>
                  <option value="epic">Epic</option>
                  <option value="subtask">Subtask</option>
                  <option value="improvement">Improvement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Story Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.story_points}
                  onChange={(e) => setFormData({ ...formData, story_points: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${light ? 'bg-white border-gray-300 text-black' : 'bg-gray-800 border-gray-700 text-white'}`}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${light ? 'bg-white border-gray-300 text-black' : 'bg-gray-800 border-gray-700 text-white'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Labels (comma-separated)
              </label>
              <input
                type="text"
                value={formData.labels}
                onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${light ? 'bg-white border-gray-300 text-black' : 'bg-gray-800 border-gray-700 text-white'}`}
                placeholder="frontend, backend, urgent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg transition-colors ${light ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' : 'border border-gray-700 text-gray-300 hover:bg-gray-800'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${light ? 'px-4 py-2 bg-blue-500 rounded-lg font-semibold text-white hover:opacity-95 transition-transform' : 'px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-semibold text-white hover:scale-105 transition-transform'}`}
              >
                Create Task
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

