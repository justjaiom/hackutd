'use client'

import { motion } from 'framer-motion'
import { Building2, Rocket, Zap } from 'lucide-react'

const tracks = [
  {
    name: 'PNC Track',
    icon: Building2,
    description: 'Enterprise solutions for modern businesses',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'NVIDIA Track',
    icon: Zap,
    description: 'Built using NVIDIA NeMo for agentic AI orchestration and reasoning',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Startup Track',
    icon: Rocket,
    description: 'Focused on developing a scalable SaaS startup platform',
    color: 'from-purple-500 to-pink-500',
  },
]

export default function Tracks() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Competition Tracks</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Adjacent participates across multiple innovation tracks
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tracks.map((track, index) => {
            const Icon = track.icon
            return (
              <motion.div
                key={track.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="relative h-full p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-800/50 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center mb-6 glow-effect`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{track.name}</h3>
                    <p className="text-gray-400 leading-relaxed">{track.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

