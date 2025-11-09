'use client'

import { motion } from 'framer-motion'
import { Sparkles, Target, Zap } from 'lucide-react'

export default function Vision() {
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
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Our Vision</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-3xl p-12 border-2 border-primary/20 overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>

            <div className="relative z-10">
              <p className="text-2xl sm:text-3xl text-black font-light leading-relaxed mb-8 text-center">
                Adjacent aims to <span className="font-bold text-primary">redefine team productivity</span> by combining agentic AI collaboration and automated project structuring
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6 bg-white rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-black font-medium">Eliminate Manual Overhead</p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl border-2 border-accent/20 hover:border-accent/40 transition-all duration-300">
                  <Target className="w-8 h-8 text-accent mx-auto mb-3" />
                  <p className="text-black font-medium">Focus on Execution</p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300">
                  <Zap className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                  <p className="text-black font-medium">Drive Innovation</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

