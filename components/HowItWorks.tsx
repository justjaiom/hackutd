'use client'

import { motion } from 'framer-motion'
import { Upload, Brain, Users, MessageSquare, CheckCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Data Ingestion',
    description: 'Users upload or connect various project inputs, including meeting recordings/notes, transcripts, or documents.',
    icon: Upload,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    title: 'Lead Agent',
    description: 'A "Lead Agent" processes this data to gain full project context and understanding. It identifies goals, key milestones, dependencies, and tensions.',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '03',
    title: 'Task Assignment',
    description: 'The lead agent spawns specialized sub-agents (design, engineering, marketing, planning). Each analyzes a specific domain and collaborates to draft detailed deliverables.',
    icon: Users,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    number: '04',
    title: 'Output Generation',
    description: 'Agents collectively build a dynamic Jira board with task cards, AI-generated priorities, deadlines, and status labels (To-Do, In Progress, Review, Done).',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-500',
  },
  {
    number: '05',
    title: 'User Interaction',
    description: 'A built-in chatbot interface allows users to ask questions about tasks, priorities, or timelines, and make live edits. Changes are instantly synchronized.',
    icon: MessageSquare,
    color: 'from-orange-500 to-red-500',
  },
]

export default function HowItWorks() {
  // condensed three-box layout (like Features) that summarizes the process
  const boxes = [
    {
      title: 'Ingest & Understand',
      desc: 'Users upload recordings, transcripts, slides, or docs. A Lead Agent processes the content to identify goals, milestones, and dependencies.',
    },
    {
      title: 'Assign & Plan',
      desc: 'The Lead Agent spawns specialized sub-agents (design, engineering, marketing) to draft tasks, priorities, and timelines.',
    },
    {
      title: 'Deliver & Interact',
      desc: 'Agents generate task boards and a chatbot interface allows queries and live edits synchronized instantly.',
    },
  ]

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-center mb-8"
        >
          How It Works
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {boxes.map((b) => (
            <div key={b.title} className="p-6 bg-white/60 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-medium mb-2">{b.title}</h3>
              <p className="text-sm text-gray-600">{b.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

