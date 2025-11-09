'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-16 bg-gradient-to-b from-white via-sky-50/30 to-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      
      {/* Soft gradient orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-100 rounded-full filter blur-3xl opacity-40" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-100 rounded-full filter blur-3xl opacity-30" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-sky-100 rounded-full filter blur-3xl opacity-35" />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 text-primary-600 text-sm font-medium shadow-sm">
            <Sparkles className="w-4 h-4" />
            Powered by NVIDIA NeMo
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 text-black"
        >
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Adjacent</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl sm:text-2xl lg:text-3xl text-black mb-4 font-medium"
        >
          AI-Powered Collaborative Project Manager
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Transform raw project data into structured, actionable plans with a network of autonomous AI agents
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="/signin"
            className="group relative px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 hover:bg-primary-hover hover:shadow-xl hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <button className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm">
            Learn More
          </button>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full blur-sm opacity-40"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 right-20 w-3 h-3 bg-accent rounded-full blur-sm opacity-40"
        />
        <motion.div
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-1/4 w-2 h-2 bg-sky-400 rounded-full blur-sm opacity-40"
        />
      </div>
    </section>
  )
}

