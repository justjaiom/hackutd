'use client'

import { motion } from 'framer-motion'
import { Brain, Code, Palette, BarChart3, MessageCircle } from 'lucide-react'

const agents = [
  {
    emoji: '🧠',
    name: 'Lead Agent',
    role: 'Project Orchestrator',
    icon: Brain,
    description: 'Central controller that understands all project inputs. Defines goals, context, and overall scope. Delegates tasks and ensures consistency across outputs.',
    color: 'from-purple-500 to-pink-500',
    responsibilities: [
      'Processes all project inputs',
      'Defines goals and scope',
      'Delegates to other agents',
      'Monitors progress continuously',
    ],
  },
  {
    emoji: '⚙️',
    name: 'Technical Agent',
    role: 'Builder',
    icon: Code,
    description: 'Handles all engineering and technical planning. Breaks requirements into tasks, defines architecture, and sets dependencies.',
    color: 'from-blue-500 to-cyan-500',
    responsibilities: [
      'Engineering planning',
      'Architecture definition',
      'Task breakdown',
      'Developer tickets',
    ],
  },
  {
    emoji: '🎨',
    name: 'Design & Product Agent',
    role: 'Visionary',
    icon: Palette,
    description: 'Focuses on UI/UX, user flow, and product strategy. Translates user goals into design tasks and ensures technical tasks align with product priorities.',
    color: 'from-pink-500 to-rose-500',
    responsibilities: [
      'UI/UX design',
      'Product strategy',
      'User flow definition',
      'Design milestones',
    ],
  },
  {
    emoji: '📊',
    name: 'Operations & Management Agent',
    role: 'Organizer',
    icon: BarChart3,
    description: 'Manages project organization, timelines, priorities, and resources. Uses AI to rank tasks by urgency and importance.',
    color: 'from-green-500 to-emerald-500',
    responsibilities: [
      'Timeline management',
      'Priority ranking',
      'Resource allocation',
      'Progress tracking',
    ],
  },
  {
    emoji: '💬',
    name: 'Communication Agent',
    role: 'Connector',
    icon: MessageCircle,
    description: 'Handles meeting notes, chat interactions, and documentation. Converts meeting transcripts into actionable items and acts as a chatbot interface.',
    color: 'from-orange-500 to-yellow-500',
    responsibilities: [
      'Meeting transcription',
      'Chatbot interface',
      'Documentation',
      'Agent synchronization',
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
            Five specialized AI agents working in harmony to manage your projects
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

