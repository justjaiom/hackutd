'use client'

import { motion } from 'framer-motion'
import { Brain, Code, BarChart3 } from 'lucide-react'

const agents = [
  {
    emoji: '�',
    name: 'Orchestrator',
    role: 'Project Orchestrator',
    icon: Brain,
    description:
      'Central controller that ingests project inputs, sets goals and scope, and delegates work to specialized agents.',
    color: 'from-purple-500 to-pink-500',
    responsibilities: [
      'Understand overall project context',
      'Define goals and milestones',
      'Delegate and coordinate agents',
    ],
  },
  {
    emoji: '🔍',
    name: 'Extractor',
    role: 'Data Extractor',
    icon: Code,
    description:
      'Extracts structured information from transcripts, documents, and recordings to create actionable data for planning.',
    color: 'from-blue-500 to-cyan-500',
    responsibilities: [
      'Parse transcripts and files',
      'Extract entities, tasks, and timelines',
      'Provide structured project data',
    ],
  },
  {
    emoji: '�️',
    name: 'Planner',
    role: 'Task Planner',
    icon: BarChart3,
    description:
      'Transforms extracted data into organized tasks, priorities, and timelines ready for execution.',
    color: 'from-green-500 to-emerald-500',
    responsibilities: [
      'Create task breakdowns',
      'Assign priorities and deadlines',
      'Generate project timelines',
    ],
  },
]

export default function Agents() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-black">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">The Agent Network</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Three specialized AI agents working in harmony to manage your projects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, index) => {
            const Icon = agent.icon
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative h-full p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Subtle colorful accent on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    {/* Emoji and Icon */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">{agent.emoji}</span>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-1 text-black">{agent.name}</h3>
                    <p className="text-sm text-primary mb-4 font-medium">{agent.role}</p>
                    <p className="text-gray-600 mb-4 leading-relaxed">{agent.description}</p>

                    {/* Responsibilities */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsibilities:</p>
                      <ul className="space-y-1">
                        {agent.responsibilities.map((resp, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Special note about tensions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 border-2 border-primary/20 shadow-lg"
        >
          <h3 className="text-2xl font-bold mb-4 text-black">🧠 Tension Detection</h3>
          <p className="text-lg text-black leading-relaxed">
            Adjacent&apos;s halo product is a live agent that compiles all information and identifies <strong className="text-primary">"Tensions"</strong> within the company/project. 
            A tension is organic work that emerges when a gap between what is and what should be is detected. 
            New projects are born from newly created or resolved tensions and additions.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

