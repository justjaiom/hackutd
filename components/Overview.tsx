'use client'

import { motion } from 'framer-motion'
import { Brain, Network, Target } from 'lucide-react'

export default function Overview() {
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
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Overview</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Adjacent is an intelligent project management platform powered by a network of autonomous AI agents
          </p>
        </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-xl border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
          >
            <Brain className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2 text-black">AI-Powered</h3>
            <p className="text-gray-600">
              Autonomous agents that collaborate to automatically generate and organize project boards
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 bg-white rounded-xl border-2 border-accent/20 hover:border-accent/40 hover:shadow-lg transition-all duration-300"
          >
            <Network className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2 text-black">Collaborative</h3>
            <p className="text-gray-600">
              Multiple specialized agents work together to create comprehensive project plans
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300"
          >
            <Target className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-black">Actionable</h3>
            <p className="text-gray-600">
              Transform raw data into structured, actionable plans with clear priorities
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 border-2 border-primary/20 shadow-lg"
        >
          <p className="text-lg text-black leading-relaxed font-medium">
          The system transforms raw project data (notes, videos, and files) into a structured, actionable Jira-style board. This board includes clear task breakdowns, assigned responsibilities, and AI-determined priorities.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

