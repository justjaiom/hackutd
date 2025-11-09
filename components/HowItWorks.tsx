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
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-black">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">How It Works</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            A seamless workflow from raw data to structured project boards
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-16 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-purple-500 opacity-40" />

          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Icon and number */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full border-2 border-primary flex items-center justify-center shadow-md">
                      <span className="text-xl font-bold text-primary">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${isEven ? 'lg:text-left' : 'lg:text-right'} text-center lg:text-left`}>
                    <h3 className="text-2xl font-bold mb-3 text-black">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

