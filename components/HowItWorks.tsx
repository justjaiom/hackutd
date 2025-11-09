'use client'

import { motion } from 'framer-motion'
import { Upload, Brain, Users, CheckCircle, MessageSquare } from 'lucide-react'
import { Timeline } from '@/components/ui/timeline'
import Image from 'next/image'

export default function HowItWorks() {
  const data = [
    {
      title: "Data Ingestion",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Users upload or connect various project inputs, including meeting recordings, 
            transcripts, documents, slides, and more. Our AI processes multiple formats 
            seamlessly to understand your project context.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg p-4">
              <Upload className="w-8 h-8 text-primary-600 dark:text-blue-300 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Multi-Format</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                PDFs, recordings, slides, and more
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg p-4">
              <Brain className="w-8 h-8 text-primary-600 dark:text-blue-300 mb-2" />
              <h4 className="font-semibold text-sm mb-1">Smart Processing</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                AI understands context automatically
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Lead Agent Analysis",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Our Lead Agent processes all data to gain full project context and understanding. 
            It identifies goals, key milestones, dependencies, and potential tensions to 
            create a comprehensive project blueprint.
          </p>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg p-6">
            <Brain className="w-12 h-12 text-purple-600 dark:text-purple-300 mb-4" />
            <h4 className="font-semibold mb-2">Intelligent Understanding</h4>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Identifies project goals and objectives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Maps out key milestones and deadlines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Discovers dependencies and relationships</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                <span>Identifies potential conflicts and tensions</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Task Assignment",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            The Lead Agent spawns specialized sub-agents for different domains like design, 
            engineering, marketing, and planning. Each agent analyzes its specific area 
            and collaborates to draft detailed, actionable deliverables.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Design Agent', 'Engineering Agent', 'Marketing Agent'].map((agent, idx) => (
              <div 
                key={agent} 
                className="bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900 dark:to-purple-900 rounded-lg p-4 text-center"
              >
                <Users className="w-8 h-8 text-primary-600 dark:text-primary-300 mx-auto mb-2" />
                <h4 className="font-semibold text-sm">{agent}</h4>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Output Generation",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Agents collectively build a dynamic Jira-style board with task cards, 
            AI-generated priorities, smart deadlines, and status labels. Everything 
            is organized and ready for your team to start working.
          </p>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg p-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-300 mb-4" />
            <h4 className="font-semibold mb-2">Smart Task Management</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/50 dark:bg-black/20 p-3 rounded">
                <span className="font-medium">To-Do</span>
                <div className="mt-1 text-neutral-600 dark:text-neutral-400">Ready to start</div>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-3 rounded">
                <span className="font-medium">In Progress</span>
                <div className="mt-1 text-neutral-600 dark:text-neutral-400">Being worked on</div>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-3 rounded">
                <span className="font-medium">Review</span>
                <div className="mt-1 text-neutral-600 dark:text-neutral-400">Awaiting feedback</div>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-3 rounded">
                <span className="font-medium">Done</span>
                <div className="mt-1 text-neutral-600 dark:text-neutral-400">Completed tasks</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "User Interaction",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            A built-in chatbot interface allows users to ask questions about tasks, 
            priorities, or timelines, and make live edits. All changes are instantly 
            synchronized across the entire project board.
          </p>
          <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg p-6">
            <MessageSquare className="w-12 h-12 text-orange-600 dark:text-orange-300 mb-4" />
            <h4 className="font-semibold mb-4">Interactive Chat Interface</h4>
            <div className="space-y-3">
              <div className="bg-white/70 dark:bg-black/30 p-3 rounded-lg text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">"What tasks are due this week?"</span>
              </div>
              <div className="bg-white/70 dark:bg-black/30 p-3 rounded-lg text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">"Update the design task priority to high"</span>
              </div>
              <div className="bg-white/70 dark:bg-black/30 p-3 rounded-lg text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">"Show me all tasks assigned to the engineering team"</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="relative py-0 px-4 sm:px-6 lg:px-8 bg-white">
  <div className="max-w-7xl mx-auto mb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From data ingestion to intelligent task management in five simple steps
          </p>
        </motion.div>
      </div>
      <Timeline data={data} />
    </section>
  )
}

