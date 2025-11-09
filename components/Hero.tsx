"use client"

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { PointerHighlight } from '@/components/ui/pointer-highlight'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-16">

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
          <PointerHighlight>
            <span className="text-black">Adjacent</span>
          </PointerHighlight>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl sm:text-2xl lg:text-3xl text-black mb-8 font-medium"
        >
          AI agents that listen, plan, and execute your next sprint — automatically
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

        {/* Decorative background removed per request */}
      </div>
    </section>
  )
}

