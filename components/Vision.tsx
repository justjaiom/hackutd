'use client'

import { motion } from 'framer-motion'
import { Sparkles, Target, Zap } from 'lucide-react'

export default function Vision() {
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
            <span className="gradient-text">Our Vision</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 rounded-3xl p-12 border border-indigo-500/30 backdrop-blur-sm overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>

            <div className="relative z-10">
              <p className="text-2xl sm:text-3xl text-white font-light leading-relaxed mb-8 text-center">
                Adjacent aims to <span className="font-bold text-indigo-300">redefine team productivity</span> by combining agentic AI collaboration and automated project structuring
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6 bg-gray-900/30 rounded-xl border border-gray-800/50">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <p className="text-gray-300 font-medium">Eliminate Manual Overhead</p>
                </div>
                <div className="text-center p-6 bg-gray-900/30 rounded-xl border border-gray-800/50">
                  <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <p className="text-gray-300 font-medium">Focus on Execution</p>
                </div>
                <div className="text-center p-6 bg-gray-900/30 rounded-xl border border-gray-800/50">
                  <Zap className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                  <p className="text-gray-300 font-medium">Drive Innovation</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

