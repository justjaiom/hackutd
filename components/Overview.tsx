'use client'

import { motion } from 'framer-motion'
import { Brain, Network, Target } from 'lucide-react'

export default function Overview() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Overview</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Adjacent is an intelligent project management platform powered by a network of autonomous AI agents
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm"
          >
            <Brain className="w-12 h-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
            <p className="text-gray-400">
              Autonomous agents that collaborate to automatically generate and organize project boards
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm"
          >
            <Network className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Collaborative</h3>
            <p className="text-gray-400">
              Multiple specialized agents work together to create comprehensive project plans
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 bg-gray-900/30 rounded-xl border border-gray-800/50 backdrop-blur-sm"
          >
            <Target className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Actionable</h3>
            <p className="text-gray-400">
              Transform raw data into structured, actionable plans with clear priorities
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl p-8 border border-indigo-500/30 backdrop-blur-sm"
        >
          <p className="text-lg text-gray-300 leading-relaxed">
          The system transforms raw project data (notes, videos, and files) into a structured, actionable Jira-style board. This board includes clear task breakdowns, assigned responsibilities, and AI-determined priorities.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

